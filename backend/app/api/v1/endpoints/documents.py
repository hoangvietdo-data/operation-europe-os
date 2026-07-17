from app.models.user import User
from app.api.deps import get_current_user
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.document import Document as DocumentModel
from app.schemas.document import Document, DocumentCreate, DocumentUpdate
import os
import shutil

router = APIRouter()
UPLOAD_DIR = "local_storage/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[Document])
def read_documents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    return db.query(DocumentModel).offset(skip).limit(limit).all()

@router.post("/", response_model=Document)
def create_document(*, db: Session = Depends(get_db), doc_in: DocumentCreate, current_user: User = Depends(get_current_user)) -> Any:
    doc = DocumentModel(**doc_in.model_dump())
    doc.user_id = current_user.id
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.post("/{id}/upload", response_model=Document)
def upload_file(*, db: Session = Depends(get_db), id: int, current_user: User = Depends(get_current_user), file: UploadFile = File(...)) -> Any:
    doc = db.query(DocumentModel).filter(DocumentModel.user_id == current_user.id, DocumentModel.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    file_location = f"{UPLOAD_DIR}/{id}_{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    doc.file_path = file_location
    doc.status = "Uploaded"
    doc.user_id = current_user.id
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.delete("/{id}")
def delete_document(*, db: Session = Depends(get_db), id: int, current_user: User = Depends(get_current_user)) -> Any:
    doc = db.query(DocumentModel).filter(DocumentModel.id == id, DocumentModel.user_id == current_user.id).first()
    if doc:
        db.delete(doc)
        db.commit()
    return {"ok": True}
