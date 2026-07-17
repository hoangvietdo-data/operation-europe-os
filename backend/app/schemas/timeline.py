from typing import Optional
from pydantic import BaseModel
import datetime

class TimelineEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[datetime.date] = None
    type: str = "Milestone"

class TimelineEventCreate(TimelineEventBase):
    pass

class TimelineEventInDBBase(TimelineEventBase):
    id: int

    class Config:
        from_attributes = True

class TimelineEvent(TimelineEventInDBBase):
    pass
