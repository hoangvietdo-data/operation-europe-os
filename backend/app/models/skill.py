from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import datetime

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    confidence = Column(Integer, default=50) # 1-100
    total_evidence = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)
    
    impacts = relationship("EvidenceSkillImpact", back_populates="skill")

class LearningEvidence(Base):
    __tablename__ = "learning_evidences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=True)
    time_spent_minutes = Column(Integer, default=0)
    
    file_url = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    github_link = Column(String, nullable=True)
    portfolio_link = Column(String, nullable=True)
    certificate_url = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    impacts = relationship("EvidenceSkillImpact", back_populates="evidence")

class EvidenceSkillImpact(Base):
    __tablename__ = "evidence_skill_impacts"
    
    id = Column(Integer, primary_key=True, index=True)
    evidence_id = Column(Integer, ForeignKey("learning_evidences.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    xp_added = Column(Integer, default=0)
    explanation = Column(String, nullable=True)
    
    evidence = relationship("LearningEvidence", back_populates="impacts")
    skill = relationship("Skill", back_populates="impacts")
