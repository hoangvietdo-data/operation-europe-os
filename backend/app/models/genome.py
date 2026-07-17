from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import datetime

class LearningRecord(Base):
    __tablename__ = "learning_records"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    learning_type = Column(String, nullable=True) # Book, Course, Project, etc.
    time_spent = Column(Integer, default=0) # Minutes
    difficulty = Column(String, nullable=True)
    reflection = Column(String, nullable=True)
    github_link = Column(String, nullable=True)
    portfolio_link = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class KnowledgeNode(Base):
    __tablename__ = "knowledge_nodes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    node_type = Column(String, nullable=False) # 'domain', 'skill', 'concept', 'thinking_pattern'
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    score = Column(Float, default=0.0)
    xp = Column(Integer, default=0)
    confidence = Column(Integer, default=0)
    evidence_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

class KnowledgeRelationship(Base):
    __tablename__ = "knowledge_relationships"
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), nullable=False)
    target_id = Column(Integer, ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), nullable=False)
    relation_type = Column(String, nullable=False) # 'belongs_to', 'related_to', 'prerequisite_for'

class KnowledgeUpdate(Base):
    __tablename__ = "knowledge_updates"
    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(Integer, ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), nullable=False)
    record_id = Column(Integer, ForeignKey("learning_records.id", ondelete="CASCADE"), nullable=False)
    xp_added = Column(Integer, default=0)
    score_added = Column(Float, default=0.0)
    reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class HeatmapActivity(Base):
    __tablename__ = "heatmap_activity"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(String, nullable=False) # YYYY-MM-DD
    intensity = Column(Integer, default=1) # 1-4 scale
