from typing import Optional
from pydantic import BaseModel
import datetime

class AchievementBase(BaseModel):
    title: str
    description: Optional[str] = None
    date_earned: Optional[datetime.date] = None
    reflection: Optional[str] = None
    evidence_file_path: Optional[str] = None

class AchievementCreate(AchievementBase):
    pass

class AchievementUpdate(AchievementBase):
    pass

class AchievementInDBBase(AchievementBase):
    id: int

    class Config:
        from_attributes = True

class Achievement(AchievementInDBBase):
    pass
