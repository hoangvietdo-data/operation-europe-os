from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.db.session import get_db
from app.models.user_setting import UserSetting  # Must import before User is used
from app.models.user import User
from app.core.security import verify_password, get_password_hash, create_access_token
from pydantic import BaseModel
from typing import Any
import traceback
import os

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=Any)
def register(*, db: Session = Depends(get_db), user_in: UserCreate):
    try:
        user = db.query(User).filter(User.email == user_in.email).first()
        if user:
            raise HTTPException(
                status_code=400,
                detail="The user with this username already exists in the system",
            )
        user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return {"id": user.id, "email": user.email}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        error_detail = traceback.format_exc()
        print(f"REGISTER ERROR: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")

@router.post("/login", response_model=Token)
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer"
    }

@router.get("/health")
def health_check():
    db_url = os.getenv("DATABASE_URL", "NOT SET")
    # Mask the password for safety
    if "@" in db_url:
        parts = db_url.split("@")
        db_url = "***@" + parts[-1]
    return {"status": "ok", "db_configured": db_url != "NOT SET", "db_url_hint": db_url}
