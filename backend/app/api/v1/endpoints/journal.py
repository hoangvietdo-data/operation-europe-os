from app.models.user import User
from app.api.deps import get_current_user
from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.journal import JournalEntry as JournalEntryModel
from app.schemas.journal import JournalEntry, JournalEntryCreate

router = APIRouter()

@router.get("/", response_model=List[JournalEntry])
def read_journal_entries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    return db.query(JournalEntryModel).order_by(JournalEntryModel.date.desc()).offset(skip).limit(limit).all()

@router.post("/", response_model=JournalEntry)
def create_journal_entry(*, db: Session = Depends(get_db), entry_in: JournalEntryCreate, current_user: User = Depends(get_current_user)) -> Any:
    entry = JournalEntryModel(**entry_in.model_dump())
    entry.user_id = current_user.id
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{entry_id}")
def delete_journal_entry(*, db: Session = Depends(get_db), entry_id: int, current_user: User = Depends(get_current_user)) -> Any:
    entry = db.query(JournalEntryModel).filter(JournalEntryModel.id == entry_id, JournalEntryModel.user_id == current_user.id).first()
    if entry:
        db.delete(entry)
        db.commit()
    return {"ok": True}
