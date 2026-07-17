from sqlalchemy import Column, ForeignKey, Integer, Date
from app.db.base_class import Base
import datetime

class AnalyticsActivity(Base):
    __tablename__ = "analytics_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, default=datetime.date.today, unique=True)
    hours_studied = Column(Integer, default=0)
    applications_sent = Column(Integer, default=0)
    github_commits = Column(Integer, default=0)
    streak_count = Column(Integer, default=0)
