from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
import datetime
import json
import random

from app.db.session import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.models.skill import Skill, LearningEvidence, EvidenceSkillImpact
from app.schemas.skill import LearningEvidenceCreate, LearningEvidence as LearningEvidenceSchema, Skill as SkillSchema
from app.models.ai_provider import AIProvider
from app.models.user_setting import UserSetting

router = APIRouter()

# Mock AI Logic if no provider is active, or we don't want to call actual LLM in this sandbox
def mock_analyze_evidence(evidence: LearningEvidenceCreate):
    return [
        {
            "skill_name": "Data Analysis",
            "category": "Data",
            "xp_to_add": random.randint(10, 50),
            "confidence_boost": random.randint(1, 5),
            "explanation": "Extracting skills based on keywords in description."
        }
    ]

@router.get("/", response_model=List[SkillSchema])
def get_skills(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Skill).filter(Skill.user_id == current_user.id).all()

@router.post("/evidence", response_model=LearningEvidenceSchema)
def submit_evidence(*, db: Session = Depends(get_db), evidence_in: LearningEvidenceCreate, current_user: User = Depends(get_current_user)):
    # 1. Save Evidence
    evidence = LearningEvidence(**evidence_in.model_dump())
    evidence.user_id = current_user.id
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    
    # 2. Call AI (using mock for now to ensure speed/reliability)
    # In a full implementation, we'd use google.generativeai here with a structured JSON prompt
    impacts_data = mock_analyze_evidence(evidence_in)
    
    # If the user specifically mentions "React" or "Marketing" in the title, let's make the mock smarter
    if "react" in evidence_in.title.lower() or "react" in evidence_in.description.lower():
        impacts_data = [{"skill_name": "React", "category": "Engineering", "xp_to_add": 45, "confidence_boost": 5, "explanation": "Demonstrated React component building."}]
    elif "marketing" in evidence_in.title.lower() or "seo" in evidence_in.description.lower():
        impacts_data = [{"skill_name": "Digital Marketing", "category": "Marketing", "xp_to_add": 30, "confidence_boost": 3, "explanation": "Applied SEO and marketing strategies."}]
        
    for imp in impacts_data:
        # Check if skill exists
        skill = db.query(Skill).filter(Skill.user_id == current_user.id, Skill.name == imp["skill_name"]).first()
        if not skill:
            skill = Skill(
                user_id=current_user.id,
                name=imp["skill_name"],
                category=imp["category"],
                level=1,
                xp=0,
                confidence=40,
                total_evidence=0
            )
            db.add(skill)
            db.commit()
            db.refresh(skill)
            
        # Update skill
        skill.xp += imp["xp_to_add"]
        skill.confidence = min(100, skill.confidence + imp["confidence_boost"])
        skill.total_evidence += 1
        skill.last_updated = datetime.datetime.utcnow()
        
        # Level up logic (e.g. 100 XP per level)
        while skill.xp >= 100:
            skill.xp -= 100
            skill.level += 1
            
        db.commit()
        
        # Save Impact
        impact = EvidenceSkillImpact(
            evidence_id=evidence.id,
            skill_id=skill.id,
            xp_added=imp["xp_to_add"],
            explanation=imp["explanation"]
        )
        db.add(impact)
        db.commit()

    db.refresh(evidence)
    return evidence

@router.get("/evidence", response_model=List[LearningEvidenceSchema])
def get_evidence(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(LearningEvidence).filter(LearningEvidence.user_id == current_user.id).order_by(LearningEvidence.created_at.desc()).all()

@router.get("/report")
def get_weekly_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    skills = db.query(Skill).filter(Skill.user_id == current_user.id).all()
    if not skills:
        return {
            "biggest_improvement": "No data yet",
            "weakest_skill": "No data yet",
            "suggested_focus": "Submit some learning evidence to get started!",
            "estimated_impact": "+0%"
        }
    
    # Mock AI report generation based on skills
    sorted_by_evidence = sorted(skills, key=lambda s: s.total_evidence, reverse=True)
    sorted_by_level = sorted(skills, key=lambda s: s.level)
    
    return {
        "biggest_improvement": sorted_by_evidence[0].name if sorted_by_evidence else "None",
        "weakest_skill": sorted_by_level[0].name if sorted_by_level else "None",
        "suggested_focus": f"Focus more on {sorted_by_level[0].name if sorted_by_level else 'learning'}.",
        "estimated_impact": "+5%"
    }
