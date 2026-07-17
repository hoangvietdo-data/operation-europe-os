from app.models.user import User
from app.api.deps import get_current_user
from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.news import NewsItem as NewsItemModel
from app.schemas.news import NewsItem, NewsItemCreate

router = APIRouter()

@router.get("/", response_model=List[NewsItem])
def read_news(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    return db.query(NewsItemModel).order_by(NewsItemModel.date_published.desc()).offset(skip).limit(limit).all()

@router.post("/", response_model=NewsItem)
def create_news(*, db: Session = Depends(get_db), item_in: NewsItemCreate, current_user: User = Depends(get_current_user)) -> Any:
    item = NewsItemModel(**item_in.model_dump())
    item.user_id = current_user.id
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{id}")
def delete_news(*, db: Session = Depends(get_db), id: int, current_user: User = Depends(get_current_user)) -> Any:
    item = db.query(NewsItemModel).filter(NewsItemModel.id == id, NewsItemModel.user_id == current_user.id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"ok": True}

@router.post("/fetch-ai")
def fetch_ai_news(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    import os, json
    from google import genai
    from google.genai import types
    from app.models.user_setting import UserSetting
    import datetime

    settings = db.query(UserSetting).filter(UserSetting.user_id == current_user.id).first()
    country_pref = settings.country_preference if settings else "Europe"

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"error": "No API key"}

    prompt = f"""
    You are a scholarship news curator. Generate 6 realistic, helpful, and recent-sounding scholarship news items relevant to a Vietnamese student targeting {country_pref} scholarships (Master's degree level). 
    Include a mix of: new deadlines, scholarship tips, policy updates, and opportunities.
    
    Return a JSON array of objects with fields: headline, summary (2-3 sentences), source, category.
    Categories must be one of: "New Opportunity", "Deadline Alert", "Tips & Strategy", "Country Update".
    Make headlines specific and actionable.
    """
    try:
        client = genai.Client(api_key=api_key)
        res = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.7)
        )
        items_data = json.loads(res.text)
        if not isinstance(items_data, list):
            items_data = items_data.get("items", [])

        created = []
        for item in items_data[:6]:
            news = NewsItemModel(
                user_id=current_user.id,
                headline=item.get("headline", "Scholarship Update"),
                summary=item.get("summary", ""),
                source=item.get("source", "AI Curated"),
                url=None,
                date_published=datetime.date.today(),
            )
            db.add(news)
            created.append(news)
        db.commit()
        for n in created:
            db.refresh(n)
        return [{"id": n.id, "headline": n.headline, "summary": n.summary, "source": n.source, "date_published": str(n.date_published), "url": n.url, "category": items_data[i].get("category", "Tips & Strategy") if i < len(items_data) else "Tips & Strategy"} for i, n in enumerate(created)]
    except Exception as e:
        return {"error": str(e)}
