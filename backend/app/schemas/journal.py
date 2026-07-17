from typing import Optional
from pydantic import BaseModel
import datetime

class JournalEntryBase(BaseModel):
    title: str
    content: str
    category: str = "Reflection"

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryUpdate(JournalEntryBase):
    pass

class JournalEntryInDBBase(JournalEntryBase):
    id: int
    date: datetime.date

    class Config:
        from_attributes = True

class JournalEntry(JournalEntryInDBBase):
    pass
