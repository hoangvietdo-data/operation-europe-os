from typing import Optional, List
from pydantic import BaseModel

class UniversityBase(BaseModel):
    name: str
    country: str
    city: Optional[str] = None
    ranking: Optional[int] = None
    living_cost: Optional[float] = None
    programs: Optional[str] = None
    official_link: Optional[str] = None

class UniversityCreate(UniversityBase):
    pass

class UniversityUpdate(UniversityBase):
    name: Optional[str] = None
    country: Optional[str] = None

class UniversityInDBBase(UniversityBase):
    id: int

    class Config:
        from_attributes = True

class University(UniversityInDBBase):
    pass
