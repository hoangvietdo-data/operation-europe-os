from typing import Optional
from pydantic import BaseModel

class MissionBase(BaseModel):
    title: str
    description: Optional[str] = None
    reward_xp: int = 100
    type: str = "Daily"
    status: str = "Pending"
    roadmap_node_id: Optional[int] = None

class MissionCreate(MissionBase):
    pass

class MissionUpdate(MissionBase):
    title: Optional[str] = None
    status: Optional[str] = None

class MissionInDBBase(MissionBase):
    id: int

    class Config:
        from_attributes = True

class Mission(MissionInDBBase):
    pass
