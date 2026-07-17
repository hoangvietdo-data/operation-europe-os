from typing import Optional
from pydantic import BaseModel

class UserSettingBase(BaseModel):
    country_preference: Optional[str] = None
    career_goal: Optional[str] = None
    ielts_target: Optional[str] = None
    current_ielts: Optional[str] = None
    target_intake: Optional[str] = None
    auto_rotate_ai: bool = False
    auto_rotate_mode: str = "random"

class UserSettingCreate(UserSettingBase):
    pass

class UserSettingUpdate(UserSettingBase):
    pass

class UserSettingInDBBase(UserSettingBase):
    id: int

    class Config:
        from_attributes = True

class UserSetting(UserSettingInDBBase):
    pass
