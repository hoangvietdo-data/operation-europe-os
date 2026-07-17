from typing import Optional
from pydantic import BaseModel
import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    progress_percentage: int = 0
    reflection: Optional[str] = None
    impact: Optional[str] = None
    metrics: Optional[str] = None
    url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    pass

class ProjectInDBBase(ProjectBase):
    id: int
    created_at: datetime.date

    class Config:
        from_attributes = True

class Project(ProjectInDBBase):
    pass
