from typing import Optional
from pydantic import BaseModel
import datetime

class KnowledgeItemBase(BaseModel):
    title: str
    url: Optional[str] = None
    tags: Optional[str] = None
    notes: Optional[str] = None

class KnowledgeItemCreate(KnowledgeItemBase):
    pass

class KnowledgeItemUpdate(KnowledgeItemBase):
    pass

class KnowledgeItemInDBBase(KnowledgeItemBase):
    id: int
    date_added: datetime.date

    class Config:
        from_attributes = True

class KnowledgeItem(KnowledgeItemInDBBase):
    pass
