from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text
from app.db.base_class import Base
import datetime

class KnowledgeItem(Base):
    __tablename__ = "knowledge_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, index=True, nullable=False)
    url = Column(String, nullable=True)
    tags = Column(String, nullable=True) # Comma separated
    notes = Column(Text, nullable=True)
    date_added = Column(Date, default=datetime.date.today)
