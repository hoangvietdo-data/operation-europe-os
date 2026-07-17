from app.models.user import User
from app.api.deps import get_current_user
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.scholarship import Scholarship as ScholarshipModel
from app.schemas.scholarship import Scholarship, ScholarshipCreate, ScholarshipUpdate

router = APIRouter()

@router.get("/", response_model=List[Scholarship])
def read_scholarships(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    scholarships = db.query(ScholarshipModel).offset(skip).limit(limit).all()
    return scholarships

@router.post("/", response_model=Scholarship)
def create_scholarship(
    *,
    db: Session = Depends(get_db),
    scholarship_in: ScholarshipCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    scholarship = ScholarshipModel(**scholarship_in.model_dump())
    scholarship.user_id = current_user.id
    db.add(scholarship)
    db.commit()
    db.refresh(scholarship)
    return scholarship

@router.get("/{id}", response_model=Scholarship)
def read_scholarship(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    scholarship = db.query(ScholarshipModel).filter(ScholarshipModel.user_id == current_user.id, ScholarshipModel.id == id).first()
    if not scholarship:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    return scholarship

@router.put("/{id}", response_model=Scholarship)
def update_scholarship(
    *,
    db: Session = Depends(get_db),
    id: int,
    scholarship_in: ScholarshipUpdate,
) -> Any:
    scholarship = db.query(ScholarshipModel).filter(ScholarshipModel.user_id == current_user.id, ScholarshipModel.id == id).first()
    if not scholarship:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    
    update_data = scholarship_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(scholarship, field, value)
        
    scholarship.user_id = current_user.id
    db.add(scholarship)
    db.commit()
    db.refresh(scholarship)
    return scholarship

@router.delete("/{id}", response_model=Scholarship)
def delete_scholarship(
    *,
    db: Session = Depends(get_db),
    id: int,
) -> Any:
    scholarship = db.query(ScholarshipModel).filter(ScholarshipModel.user_id == current_user.id, ScholarshipModel.id == id).first()
    if not scholarship:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    db.delete(scholarship)
    db.commit()
    return scholarship
