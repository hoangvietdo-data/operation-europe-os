from app.models.user import User
from app.api.deps import get_current_user
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user_setting import UserSetting as UserSettingModel
from app.schemas.user_setting import UserSetting, UserSettingUpdate
from app.models.ai_provider import AIProvider as AIProviderModel
from app.schemas.ai_provider import AIProvider, AIProviderCreate, AIProviderUpdate
from app.models.dashboard_v2 import XPLog, StudySession, DailySummary, TaskItem

router = APIRouter()

@router.post("/reset-progress")
def reset_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    # Delete all progress related data for the current user
    db.query(XPLog).filter(XPLog.user_id == current_user.id).delete()
    db.query(StudySession).filter(StudySession.user_id == current_user.id).delete()
    db.query(DailySummary).filter(DailySummary.user_id == current_user.id).delete()
    db.query(TaskItem).filter(TaskItem.user_id == current_user.id).delete()
    db.commit()
    return {"message": "All progress has been reset successfully"}

# --- User Settings ---
@router.get("/", response_model=UserSetting)
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    settings = db.query(UserSettingModel).first()
    if not settings:
        settings = UserSettingModel()
        settings.user_id = current_user.id
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("/", response_model=UserSetting)
def update_settings(*, db: Session = Depends(get_db), settings_in: UserSettingUpdate, current_user: User = Depends(get_current_user)) -> Any:
    settings = db.query(UserSettingModel).first()
    if not settings:
        settings = UserSettingModel()
        settings.user_id = current_user.id
        db.add(settings)
    
    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
        
    db.commit()
    db.refresh(settings)
    return settings

# --- AI Providers ---
@router.get("/ai-providers", response_model=List[AIProvider])
def list_ai_providers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    return db.query(AIProviderModel).filter(AIProviderModel.user_id == current_user.id, AIProviderModel.user_id == current_user.id).all()

@router.post("/ai-providers", response_model=AIProvider)
def create_ai_provider(*, db: Session = Depends(get_db), provider_in: AIProviderCreate, current_user: User = Depends(get_current_user)) -> Any:
    provider = db.query(AIProviderModel).filter(AIProviderModel.user_id == current_user.id, AIProviderModel.provider_name == provider_in.provider_name).first()
    if provider:
        raise HTTPException(status_code=400, detail="Provider already exists. Use PUT to update.")
    
    new_provider = AIProviderModel(**provider_in.model_dump())
    new_provider.user_id = current_user.id
    db.add(new_provider)
    db.commit()
    db.refresh(new_provider)
    return new_provider

@router.put("/ai-providers/{provider_name}", response_model=AIProvider)
def update_ai_provider(*, db: Session = Depends(get_db), provider_name: str, current_user: User = Depends(get_current_user), provider_in: AIProviderUpdate) -> Any:
    provider = db.query(AIProviderModel).filter(AIProviderModel.user_id == current_user.id, AIProviderModel.provider_name == provider_name).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found.")
        
    update_data = provider_in.model_dump(exclude_unset=True)
    
    # If setting this provider to active, deactivate others
    if update_data.get("is_active"):
        db.query(AIProviderModel).update({AIProviderModel.is_active: False})
        
    for field, value in update_data.items():
        setattr(provider, field, value)
        
    db.commit()
    db.refresh(provider)
    return provider
