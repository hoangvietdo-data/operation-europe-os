from typing import Optional
from pydantic import BaseModel
import datetime

class NewsItemBase(BaseModel):
    headline: str
    summary: Optional[str] = None
    source: str
    url: Optional[str] = None

class NewsItemCreate(NewsItemBase):
    pass

class NewsItemUpdate(NewsItemBase):
    pass

class NewsItemInDBBase(NewsItemBase):
    id: int
    date_published: datetime.date

    class Config:
        from_attributes = True

class NewsItem(NewsItemInDBBase):
    pass
