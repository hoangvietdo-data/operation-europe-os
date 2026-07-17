from typing import Optional, List
from pydantic import BaseModel

class RoadmapNodeBase(BaseModel):
    title: str
    description: Optional[str] = None
    estimated_hours: int = 0
    difficulty: str = "Medium"
    reward_xp: int = 100
    status: str = "Locked"
    type: str = "Task"

class RoadmapNodeCreate(RoadmapNodeBase):
    pass

class RoadmapNodeUpdate(RoadmapNodeBase):
    title: Optional[str] = None

class RoadmapNodeInDBBase(RoadmapNodeBase):
    id: int

    class Config:
        from_attributes = True

class RoadmapNode(RoadmapNodeInDBBase):
    pass

class RoadmapEdgeBase(BaseModel):
    source_node_id: int
    target_node_id: int

class RoadmapEdgeCreate(RoadmapEdgeBase):
    pass

class RoadmapEdgeInDBBase(RoadmapEdgeBase):
    id: int

    class Config:
        from_attributes = True

class RoadmapEdge(RoadmapEdgeInDBBase):
    pass
