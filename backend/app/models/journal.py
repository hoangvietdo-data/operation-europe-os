from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text
from app.db.base_class import Base
import datetime

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, index=True, nullable=False)
    content = Column(Text, nullable=False)
    date = Column(Date, default=datetime.date.today)
    category = Column(String, default="Reflection") # Decision, Reflection, Failure, Interview
