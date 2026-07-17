from sqlalchemy import Column, Integer, String, ForeignKey, Date
from app.db.base_class import Base
import datetime

class Project(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    progress_percentage = Column(Integer, default=0)
    reflection = Column(String, nullable=True)
    impact = Column(String, nullable=True)
    metrics = Column(String, nullable=True)
    url = Column(String, nullable=True)
    created_at = Column(Date, default=datetime.date.today)
