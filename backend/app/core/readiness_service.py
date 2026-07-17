import json
import os
from sqlalchemy.orm import Session
from typing import Any
from pydantic import BaseModel, Field
from typing import List, Optional

# Wait for genai module
from google import genai
from google.genai import types

from app.models.user import User
from app.models.user_setting import UserSetting
from app.models.document import Document
from app.models.project import Project
from app.models.scholarship import Scholarship
from app.models.genome import LearningRecord

class ReadinessNextAction(BaseModel):
    title: str = Field(description="Actionable title of the next task")
    impact: float = Field(description="Estimated overall readiness increase (in percent) if completed")

class ReadinessCategory(BaseModel):
    name: str = Field(description="Must be one of: English, Experience, Portfolio, SOP, Recommendation Letters, Leadership, Required Documents, Applications")
    progress: float = Field(description="Current progress percentage (0-100). Never give 100% unless there is explicit concrete evidence.")
    target: str = Field(description="The goal or target for this category")
    evidence_used: List[str] = Field(description="List of specific titles of documents, projects, or records from the user profile that prove this progress")
    confidence_score: int = Field(description="How confident the AI is in this assessment (0-100)")
    estimated_gain: float = Field(description="Estimated readiness increase if the missing elements are completed")
    missing: Optional[str] = Field(description="What is missing or needed to reach 100%")
    ai_reasoning: str = Field(description="Detailed reasoning for the score and assessment")
    estimated_effort: str = Field(description="Estimated time or effort required to complete the missing items (e.g. '2 weeks', '4 hours')")

class ReadinessAssessment(BaseModel):
    overall: float = Field(description="Overall readiness score (0-100)")
    categories: List[ReadinessCategory]
    next_action: ReadinessNextAction

def calculate_ai_readiness(db: Session, user: User) -> dict:
    # 1. Gather all data
    settings = db.query(UserSetting).filter(UserSetting.user_id == user.id).first()
    documents = db.query(Document).filter(Document.user_id == user.id).all()
    projects = db.query(Project).filter(Project.user_id == user.id).all()
    scholarships = db.query(Scholarship).filter(Scholarship.user_id == user.id).all()
    records = db.query(LearningRecord).filter(LearningRecord.user_id == user.id).all()
    
    # 2. Format Data for AI
    profile_data = {
        "settings": {
            "career_goal": settings.career_goal if settings else None,
            "ielts_target": settings.ielts_target if settings else "7.0",
            "current_ielts": settings.current_ielts if settings else None,
            "target_intake": settings.target_intake if settings else None,
            "country_preference": settings.country_preference if settings else None,
        },
        "documents": [{"type": d.type, "title": d.title, "status": d.status} for d in documents],
        "projects": [{"name": p.name, "description": p.description, "progress": p.progress_percentage} for p in projects],
        "applications": [{"name": s.name, "status": s.status} for s in scholarships],
        "learning_records": [{"title": r.title, "type": r.learning_type} for r in records]
    }
    
    prompt = f"""
    You are an expert AI scholarship admission consultant. Assess the user's readiness for applying to scholarships based on the following profile data.
    
    PROFILE DATA:
    {json.dumps(profile_data, indent=2)}
    
    INSTRUCTIONS:
    Evaluate the following 8 categories: English, Experience, Portfolio, SOP, Recommendation Letters, Leadership, Required Documents, Applications.
    For each category:
    - Determine 'progress' (0-100). Do NOT give 100% unless there is concrete evidence in the profile data.
    - Identify 'evidence_used' strictly from the profile data provided.
    - Give a 'confidence_score' based on how much data you have.
    - Identify 'missing' requirements and give 'ai_reasoning'.
    
    Finally, calculate an 'overall' score and determine the single 'next_action' that has the highest impact on their readiness.
    Output strictly as a JSON object matching the provided schema.
    """
    
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return _fallback_readiness()
            
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ReadinessAssessment,
                temperature=0.2,
            ),
        )
        
        assessment = json.loads(response.text)
        
        # Save to DB
        user.readiness_data = json.dumps(assessment)
        db.commit()
        
        return assessment
        
    except Exception as e:
        print(f"Error calculating AI readiness: {e}")
        return _fallback_readiness()

def _fallback_readiness():
    return {
        "overall": 0.0,
        "next_action": {"title": "Update your profile", "impact": 10.0},
        "categories": []
    }
