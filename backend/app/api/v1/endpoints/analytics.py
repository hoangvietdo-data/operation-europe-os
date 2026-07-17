from app.models.user import User
from app.api.deps import get_current_user
from typing import Any, List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.analytics import AnalyticsActivity as AnalyticsActivityModel
from app.schemas.analytics import AnalyticsActivity, AnalyticsActivityCreate
import datetime

router = APIRouter()

@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    activities = db.query(AnalyticsActivityModel).filter(AnalyticsActivityModel.user_id == current_user.id, AnalyticsActivityModel.user_id == current_user.id).all()
    total_hours = sum(a.hours_studied for a in activities)
    total_apps = sum(a.applications_sent for a in activities)
    
    # Simple readiness score calculation based on hardcoded metrics for now
    readiness = {
        "Language": 40,
        "Portfolio": 70,
        "Academics": 85,
        "Extracurriculars": 50,
        "SOP": 20
    }
    
    return {
        "total_hours": total_hours,
        "total_applications": total_apps,
        "readiness_radar": readiness,
        "streak": 5 # mock streak
    }

@router.post("/log", response_model=AnalyticsActivity)
def log_activity(*, db: Session = Depends(get_db), activity_in: AnalyticsActivityCreate, current_user: User = Depends(get_current_user)) -> Any:
    today = datetime.date.today()
    activity = db.query(AnalyticsActivityModel).filter(AnalyticsActivityModel.user_id == current_user.id, AnalyticsActivityModel.date == today).first()
    
    if activity:
        activity.hours_studied += activity_in.hours_studied
        activity.applications_sent += activity_in.applications_sent
        activity.github_commits += activity_in.github_commits
    else:
        activity = AnalyticsActivityModel(**activity_in.model_dump(), date=today)
        
    activity.user_id = current_user.id
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity
