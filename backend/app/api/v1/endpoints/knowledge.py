from app.models.user import User
from app.api.deps import get_current_user
from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.knowledge import KnowledgeItem as KnowledgeItemModel
from app.schemas.knowledge import KnowledgeItem, KnowledgeItemCreate

router = APIRouter()

@router.get("/", response_model=List[KnowledgeItem])
def read_knowledge(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    return db.query(KnowledgeItemModel).order_by(KnowledgeItemModel.id.desc()).offset(skip).limit(limit).all()

@router.post("/", response_model=KnowledgeItem)
def create_knowledge(*, db: Session = Depends(get_db), item_in: KnowledgeItemCreate, current_user: User = Depends(get_current_user)) -> Any:
    item = KnowledgeItemModel(**item_in.model_dump())
    item.user_id = current_user.id
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{id}")
def delete_knowledge(*, db: Session = Depends(get_db), id: int, current_user: User = Depends(get_current_user)) -> Any:
    item = db.query(KnowledgeItemModel).filter(KnowledgeItemModel.id == id, KnowledgeItemModel.user_id == current_user.id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"ok": True}
