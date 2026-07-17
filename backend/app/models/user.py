from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    
    # RPG System
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    avatar_url = Column(String, default="https://rickandmortyapi.com/api/character/avatar/1.jpeg")
    readiness_data = Column(String, nullable=True) # JSON cache of AI assessment
    current_frame = Column(String, default="iron_recruit")
    unlocked_frames = Column(String, default="iron_recruit") # comma-separated list
    current_title = Column(String, default="Novice Scholar")
    
    settings = relationship("UserSetting", back_populates="user", uselist=False, cascade="all, delete-orphan")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
