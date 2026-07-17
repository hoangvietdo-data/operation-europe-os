from app.models.user import User
from app.api.deps import get_current_user
from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
import datetime

from app.db.session import get_db
from app.models.dashboard_v2 import Quote, TaskItem, StudySession, DailySummary, XPLog
from app.models.document import Document
from app.models.project import Project
from app.models.scholarship import Scholarship
from app.models.user_setting import UserSetting as UserSettingModel
from app.schemas.dashboard import QuoteSchema, TaskItem as TaskSchema, TaskItemCreate, TaskItemUpdate, StudySession as StudySchema, StudySessionCreate, DailySummary as DailySchema, DailySummaryCreate, XPLog as XPSchema, XPLogCreate

router = APIRouter()

@router.get("/quotes/random", response_model=QuoteSchema)
def get_random_quote(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Efficient random selection in sqlite
    return db.query(Quote).order_by(func.random()).first()

# --- Tasks ---
@router.get("/tasks", response_model=List[TaskSchema])
def get_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(TaskItem).order_by(TaskItem.order_index).all()

@router.post("/tasks", response_model=TaskSchema)
def create_task(*, db: Session = Depends(get_db), task_in: TaskItemCreate, current_user: User = Depends(get_current_user)):
    new_task = TaskItem(**task_in.model_dump())
    new_task.user_id = current_user.id
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.put("/tasks/{task_id}", response_model=TaskSchema)
def update_task(*, db: Session = Depends(get_db), task_id: int, current_user: User = Depends(get_current_user), task_in: TaskItemUpdate):
    task = db.query(TaskItem).filter(TaskItem.id == task_id, TaskItem.user_id == current_user.id).first()
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task

@router.delete("/tasks/{task_id}")
def delete_task(*, db: Session = Depends(get_db), task_id: int, current_user: User = Depends(get_current_user)):
    task = db.query(TaskItem).filter(TaskItem.id == task_id, TaskItem.user_id == current_user.id).first()
    db.delete(task)
    db.commit()
    return {"ok": True}

# --- Study Sessions ---
@router.get("/study-sessions", response_model=List[StudySchema])
def get_study_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(StudySession).filter(StudySession.user_id == current_user.id, StudySession.user_id == current_user.id).all()

@router.post("/study-sessions", response_model=StudySchema)
def create_study_session(*, db: Session = Depends(get_db), session_in: StudySessionCreate, current_user: User = Depends(get_current_user)):
    new_session = StudySession(**session_in.model_dump())
    new_session.user_id = current_user.id
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

# --- Evening Reflection ---
@router.post("/daily-summary", response_model=DailySchema)
def create_daily_summary(*, db: Session = Depends(get_db), summary_in: DailySummaryCreate, current_user: User = Depends(get_current_user)):
    target_date = summary_in.date or datetime.date.today()
    summary = db.query(DailySummary).filter(DailySummary.user_id == current_user.id, DailySummary.date == target_date).first()
    if summary:
        update_data = summary_in.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            setattr(summary, k, v)
    else:
        summary = DailySummary(**summary_in.model_dump(exclude_unset=True))
        summary.date = target_date
        summary.user_id = current_user.id
        db.add(summary)
    
    db.commit()
    db.refresh(summary)
    return summary

@router.get("/daily-summary/today", response_model=DailySchema)
def get_today_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    summary = db.query(DailySummary).filter(DailySummary.user_id == current_user.id, DailySummary.date == datetime.date.today()).first()
    if not summary:
        return DailySummary(id=0, date=datetime.date.today())
    return summary

@router.get("/daily-summaries", response_model=List[DailySchema])
def get_all_summaries(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(DailySummary).filter(DailySummary.user_id == current_user.id).order_by(DailySummary.date.desc()).all()

@router.delete("/daily-summaries/{summary_id}")
def delete_daily_summary(*, db: Session = Depends(get_db), summary_id: int, current_user: User = Depends(get_current_user)) -> Any:
    summary = db.query(DailySummary).filter(DailySummary.id == summary_id, DailySummary.user_id == current_user.id).first()
    if summary:
        db.delete(summary)
        db.commit()
    return {"ok": True}

# --- Gamification (XP) ---
@router.get("/xp", response_model=List[XPSchema])
def get_xp_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(XPLog).order_by(XPLog.created_at.desc()).all()

from app.core.xp_service import add_xp

@router.post("/xp", response_model=XPSchema)
def log_xp(*, db: Session = Depends(get_db), xp_in: XPLogCreate, current_user: User = Depends(get_current_user)):
    new_xp = XPLog(**xp_in.model_dump())
    new_xp.user_id = current_user.id
    db.add(new_xp)
    
    # RPG Integration
    level_info = add_xp(db, current_user, xp_in.amount)
    
    db.commit()
    db.refresh(new_xp)
    return new_xp

from app.core.readiness_service import calculate_ai_readiness
import json

@router.get("/readiness")
def get_readiness(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.readiness_data:
        try:
            return json.loads(current_user.readiness_data)
        except:
            pass
    from app.core.readiness_service import _fallback_readiness
    return _fallback_readiness()

@router.post("/readiness/refresh")
def refresh_readiness(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return calculate_ai_readiness(db, current_user)
