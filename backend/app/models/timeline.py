from sqlalchemy import Column, Integer, String, ForeignKey, Date
from app.db.base_class import Base
import datetime

class TimelineEvent(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    date = Column(Date, default=datetime.date.today)
    type = Column(String, default="Milestone") # Milestone, Achievement, Application
