from app.models.user import User
from app.api.deps import get_current_user
from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.achievement import Achievement as AchievementModel
from app.schemas.achievement import Achievement, AchievementCreate

router = APIRouter()

@router.get("/", response_model=List[Achievement])
def read_achievements(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    return db.query(AchievementModel).offset(skip).limit(limit).all()

@router.post("/", response_model=Achievement)
def create_achievement(*, db: Session = Depends(get_db), achievement_in: AchievementCreate, current_user: User = Depends(get_current_user)) -> Any:
    achievement = AchievementModel(**achievement_in.model_dump())
    achievement.user_id = current_user.id
    db.add(achievement)
    db.commit()
    db.refresh(achievement)
    return achievement

@router.delete("/{id}")
def delete_achievement(*, db: Session = Depends(get_db), id: int, current_user: User = Depends(get_current_user)) -> Any:
    achievement = db.query(AchievementModel).filter(AchievementModel.id == id, AchievementModel.user_id == current_user.id).first()
    if achievement:
        db.delete(achievement)
        db.commit()
    return {"ok": True}
