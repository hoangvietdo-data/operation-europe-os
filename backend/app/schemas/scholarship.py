from typing import Optional
from pydantic import BaseModel

class ScholarshipBase(BaseModel):
    name: str
    country: str
    university_id: Optional[int] = None
    coverage: Optional[str] = None
    tuition: bool = False
    monthly_stipend: Optional[float] = None
    insurance: bool = False
    flight: bool = False
    visa: bool = False
    application_period: Optional[str] = None
    deadline: Optional[str] = None
    website: Optional[str] = None
    difficulty: Optional[str] = None
    status: str = "Not Started"
    priority: str = "Medium"
    personal_notes: Optional[str] = None

class ScholarshipCreate(ScholarshipBase):
    pass

class ScholarshipUpdate(ScholarshipBase):
    name: Optional[str] = None
    country: Optional[str] = None

class ScholarshipInDBBase(ScholarshipBase):
    id: int

    class Config:
        from_attributes = True

class Scholarship(ScholarshipInDBBase):
    pass
