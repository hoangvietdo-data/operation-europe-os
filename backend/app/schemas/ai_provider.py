from typing import Optional
from pydantic import BaseModel

class AIProviderBase(BaseModel):
    provider_name: str
    api_key: str
    default_model: str
    is_active: bool = False

class AIProviderCreate(AIProviderBase):
    pass

class AIProviderUpdate(BaseModel):
    api_key: Optional[str] = None
    default_model: Optional[str] = None
    is_active: Optional[bool] = None

class AIProviderInDBBase(AIProviderBase):
    id: int

    class Config:
        from_attributes = True

class AIProvider(AIProviderInDBBase):
    pass
