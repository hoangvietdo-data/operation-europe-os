from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Scholarship(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, index=True, nullable=False)
    country = Column(String, index=True, nullable=False)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=True)
    coverage = Column(String, nullable=True)
    tuition = Column(Boolean, default=False)
    monthly_stipend = Column(Float, nullable=True)
    insurance = Column(Boolean, default=False)
    flight = Column(Boolean, default=False)
    visa = Column(Boolean, default=False)
    application_period = Column(String, nullable=True)
    deadline = Column(String, nullable=True)
    website = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)
    status = Column(String, default="Not Started")
    priority = Column(String, default="Medium")
    personal_notes = Column(String, nullable=True)

    university = relationship("University", back_populates="scholarships")
