from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from app.db.base_class import Base

class AIProvider(Base):
    __tablename__ = "ai_providers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider_name = Column(String, unique=True, index=True, nullable=False) # e.g. "openai", "gemini"
    api_key = Column(String, nullable=False)
    default_model = Column(String, nullable=False) # e.g. "gpt-4o", "gemini-1.5-pro"
    base_url = Column(String, nullable=True) # Custom endpoint
    is_active = Column(Boolean, default=False)
