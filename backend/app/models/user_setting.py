from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class UserSetting(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    country_preference = Column(String, nullable=True)
    career_goal = Column(String, nullable=True)
    ielts_target = Column(String, nullable=True)
    current_ielts = Column(String, nullable=True)
    target_intake = Column(String, nullable=True)
    auto_rotate_ai = Column(Boolean, default=False)
    auto_rotate_mode = Column(String, default="random") # "random" or "round_robin"
    
    user = relationship("User", back_populates="settings")
