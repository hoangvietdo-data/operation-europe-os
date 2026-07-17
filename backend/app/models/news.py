from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text
from app.db.base_class import Base
import datetime

class NewsItem(Base):
    __tablename__ = "news_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    headline = Column(String, index=True, nullable=False)
    summary = Column(Text, nullable=True)
    source = Column(String, nullable=False)
    url = Column(String, nullable=True)
    date_published = Column(Date, default=datetime.date.today)
