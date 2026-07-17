from sqlalchemy import Column, Integer, String, ForeignKey, Date
from app.db.base_class import Base
import datetime

class Achievement(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    date_earned = Column(Date, default=datetime.date.today)
    reflection = Column(String, nullable=True)
    evidence_file_path = Column(String, nullable=True)
