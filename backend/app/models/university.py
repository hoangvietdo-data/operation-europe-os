from sqlalchemy import Column, Integer, String, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class University(Base):
    __tablename__ = "universities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, index=True, nullable=False)
    country = Column(String, index=True, nullable=False)
    city = Column(String, nullable=True)
    ranking = Column(Integer, nullable=True)
    living_cost = Column(Float, nullable=True)
    programs = Column(Text, nullable=True) # JSON or comma separated
    official_link = Column(String, nullable=True)

    scholarships = relationship("Scholarship", back_populates="university")
