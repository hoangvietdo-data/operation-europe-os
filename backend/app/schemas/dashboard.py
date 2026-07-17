from typing import Optional, List
from pydantic import BaseModel
import datetime

class QuoteSchema(BaseModel):
    id: int
    text: str
    author: str
    
    class Config:
        from_attributes = True

class TaskItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "Medium"
    estimated_duration: int = 30
    category: Optional[str] = None
    deadline: Optional[datetime.datetime] = None
    difficulty: str = "Normal"
    is_completed: bool = False
    order_index: int = 0
    repeat_pattern: Optional[str] = None

class TaskItemCreate(TaskItemBase):
    pass

class TaskItemUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None
    order_index: Optional[int] = None
    priority: Optional[str] = None
    estimated_duration: Optional[int] = None

class TaskItem(TaskItemBase):
    id: int
    created_at: datetime.datetime
    
    class Config:
        from_attributes = True

class StudySessionBase(BaseModel):
    duration_minutes: int
    mode: str

class StudySessionCreate(StudySessionBase):
    pass

class StudySession(StudySessionBase):
    id: int
    date: datetime.date
    created_at: datetime.datetime
    
    class Config:
        from_attributes = True

class DailySummaryBase(BaseModel):
    finished_today: Optional[str] = None
    blocked_by: Optional[str] = None
    tomorrow_plan: Optional[str] = None
    focus_score: Optional[str] = None
    rating: Optional[int] = None

class DailySummaryCreate(DailySummaryBase):
    date: Optional[datetime.date] = None

class DailySummary(DailySummaryBase):
    id: int
    date: datetime.date
    
    class Config:
        from_attributes = True

class XPLogBase(BaseModel):
    amount: int
    reason: str

class XPLogCreate(XPLogBase):
    pass

class XPLog(XPLogBase):
    id: int
    created_at: datetime.datetime
    
    class Config:
        from_attributes = True
