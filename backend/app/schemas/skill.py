from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class EvidenceSkillImpactBase(BaseModel):
    skill_id: int
    xp_added: int
    explanation: Optional[str] = None

class EvidenceSkillImpact(EvidenceSkillImpactBase):
    id: int
    evidence_id: int
    
    class Config:
        from_attributes = True

class LearningEvidenceBase(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    time_spent_minutes: int = 0
    file_url: Optional[str] = None
    image_url: Optional[str] = None
    github_link: Optional[str] = None
    portfolio_link: Optional[str] = None
    certificate_url: Optional[str] = None

class LearningEvidenceCreate(LearningEvidenceBase):
    pass

class LearningEvidence(LearningEvidenceBase):
    id: int
    user_id: int
    created_at: datetime
    impacts: List[EvidenceSkillImpact] = []
    
    class Config:
        from_attributes = True

class SkillBase(BaseModel):
    name: str
    category: str

class SkillCreate(SkillBase):
    pass

class Skill(SkillBase):
    id: int
    user_id: int
    level: int
    xp: int
    confidence: int
    total_evidence: int
    last_updated: datetime
    
    class Config:
        from_attributes = True

# Output schema for AI response parsing
class AISkillImpact(BaseModel):
    skill_name: str
    category: str
    xp_to_add: int
    confidence_boost: int
    explanation: str

class AIAnalysisResult(BaseModel):
    impacts: List[AISkillImpact]
