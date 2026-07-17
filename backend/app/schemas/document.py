from typing import Optional
from pydantic import BaseModel
import datetime

class DocumentBase(BaseModel):
    name: str
    type: str
    file_path: Optional[str] = None
    expiry_date: Optional[datetime.date] = None
    status: str = "Missing"

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(DocumentBase):
    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None

class DocumentInDBBase(DocumentBase):
    id: int
    created_at: datetime.date

    class Config:
        from_attributes = True

class Document(DocumentInDBBase):
    pass
