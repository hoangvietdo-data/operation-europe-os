from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class LearningRecordBase(BaseModel):
    title: str
    description: str
    learning_type: Optional[str] = None
    time_spent: int = 0
    difficulty: Optional[str] = None
    reflection: Optional[str] = None
    github_link: Optional[str] = None
    portfolio_link: Optional[str] = None

class LearningRecordCreate(LearningRecordBase):
    pass

class LearningRecord(LearningRecordBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class KnowledgeNodeBase(BaseModel):
    node_type: str
    name: str
    description: Optional[str] = None
    score: float = 0.0
    xp: int = 0
    confidence: int = 0
    evidence_count: int = 0

class KnowledgeNode(KnowledgeNodeBase):
    id: int
    user_id: int
    created_at: datetime
    last_updated: datetime
    
    class Config:
        from_attributes = True

class KnowledgeRelationshipBase(BaseModel):
    source_id: int
    target_id: int
    relation_type: str

class KnowledgeRelationship(KnowledgeRelationshipBase):
    id: int
    
    class Config:
        from_attributes = True

class GraphData(BaseModel):
    nodes: List[Dict[str, Any]]
    links: List[Dict[str, Any]]

# AI Parsing schemas
class AINodeExtraction(BaseModel):
    name: str
    node_type: str # 'domain', 'skill', 'concept', 'thinking_pattern'
    score_boost: float
    xp_boost: int
    confidence_boost: int
    description: str

class AIRelationshipExtraction(BaseModel):
    source_name: str
    target_name: str
    relation_type: str

class AIGenomeExtraction(BaseModel):
    nodes: List[AINodeExtraction]
    relationships: List[AIRelationshipExtraction]
