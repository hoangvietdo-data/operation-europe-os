from app.models.user import User
from app.api.deps import get_current_user
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.university import University as UniversityModel
from app.schemas.university import University, UniversityCreate, UniversityUpdate

router = APIRouter()

@router.get("/", response_model=List[University])
def read_universities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    universities = db.query(UniversityModel).offset(skip).limit(limit).all()
    return universities

@router.post("/", response_model=University)
def create_university(
    *,
    db: Session = Depends(get_db),
    university_in: UniversityCreate,
) -> Any:
    university = UniversityModel(**university_in.model_dump())
    university.user_id = current_user.id
    db.add(university)
    db.commit()
    db.refresh(university)
    return university

@router.get("/{id}", response_model=University)
def read_university(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    university = db.query(UniversityModel).filter(UniversityModel.user_id == current_user.id, UniversityModel.id == id).first()
    if not university:
        raise HTTPException(status_code=404, detail="University not found")
    return university

@router.put("/{id}", response_model=University)
def update_university(
    *,
    db: Session = Depends(get_db),
    id: int,
    university_in: UniversityUpdate,
) -> Any:
    university = db.query(UniversityModel).filter(UniversityModel.user_id == current_user.id, UniversityModel.id == id).first()
    if not university:
        raise HTTPException(status_code=404, detail="University not found")
    
    update_data = university_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(university, field, value)
        
    university.user_id = current_user.id
    db.add(university)
    db.commit()
    db.refresh(university)
    return university

@router.delete("/{id}", response_model=University)
def delete_university(
    *,
    db: Session = Depends(get_db),
    id: int,
) -> Any:
    university = db.query(UniversityModel).filter(UniversityModel.user_id == current_user.id, UniversityModel.id == id).first()
    if not university:
        raise HTTPException(status_code=404, detail="University not found")
    db.delete(university)
    db.commit()
    return university
