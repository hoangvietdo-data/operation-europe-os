from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Date, DateTime, Text, Float
from app.db.base_class import Base
import datetime

class Quote(Base):
    __tablename__ = "quotes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    author = Column(String, nullable=False)

class TaskItem(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String, default="Medium")
    estimated_duration = Column(Integer, default=30) # minutes
    category = Column(String, nullable=True)
    deadline = Column(DateTime, nullable=True)
    difficulty = Column(String, default="Normal")
    is_completed = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)
    repeat_pattern = Column(String, nullable=True) # e.g., "daily", "weekly"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class StudySession(Base):
    __tablename__ = "study_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    mode = Column(String, nullable=False) # e.g. 25, 45, custom
    date = Column(Date, default=datetime.date.today)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DailySummary(Base):
    __tablename__ = "daily_summaries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, default=datetime.date.today, unique=True)
    finished_today = Column(Text, nullable=True)
    blocked_by = Column(Text, nullable=True)
    tomorrow_plan = Column(Text, nullable=True)
    focus_score = Column(String, nullable=True)
    rating = Column(Integer, nullable=True)

class XPLog(Base):
    __tablename__ = "xp_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
