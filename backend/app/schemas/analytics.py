from typing import Optional
from pydantic import BaseModel
import datetime

class AnalyticsActivityBase(BaseModel):
    hours_studied: int = 0
    applications_sent: int = 0
    github_commits: int = 0
    streak_count: int = 0

class AnalyticsActivityCreate(AnalyticsActivityBase):
    pass

class AnalyticsActivityInDBBase(AnalyticsActivityBase):
    id: int
    date: datetime.date

    class Config:
        from_attributes = True

class AnalyticsActivity(AnalyticsActivityInDBBase):
    pass
