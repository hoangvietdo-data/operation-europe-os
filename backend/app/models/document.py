from sqlalchemy import Column, Integer, String, ForeignKey, Date
from app.db.base_class import Base
import datetime

class Document(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False) # CV, Passport, IELTS, SOP, etc.
    file_path = Column(String, nullable=True)
    expiry_date = Column(Date, nullable=True)
    status = Column(String, default="Missing") # Missing, Uploaded, Expired
    
    # Store dates
    created_at = Column(Date, default=datetime.date.today)
