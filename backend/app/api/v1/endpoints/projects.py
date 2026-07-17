from app.models.user import User
from app.api.deps import get_current_user
from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.project import Project as ProjectModel
from app.schemas.project import Project, ProjectCreate

router = APIRouter()

@router.get("/", response_model=List[Project])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    return db.query(ProjectModel).offset(skip).limit(limit).all()

@router.post("/", response_model=Project)
def create_project(*, db: Session = Depends(get_db), project_in: ProjectCreate, current_user: User = Depends(get_current_user)) -> Any:
    project = ProjectModel(**project_in.model_dump())
    project.user_id = current_user.id
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

from app.schemas.project import ProjectUpdate

@router.put("/{id}", response_model=Project)
def update_project(*, db: Session = Depends(get_db), id: int, project_in: ProjectUpdate, current_user: User = Depends(get_current_user)) -> Any:
    from app.models.project import Project as ProjectModel
    project = db.query(ProjectModel).filter(ProjectModel.id == id, ProjectModel.user_id == current_user.id).first()
    if not project:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Project not found")
    for field, value in project_in.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{id}")
def delete_project(*, db: Session = Depends(get_db), id: int, current_user: User = Depends(get_current_user)) -> Any:
    from app.models.project import Project as ProjectModel
    project = db.query(ProjectModel).filter(ProjectModel.id == id, ProjectModel.user_id == current_user.id).first()
    if project:
        db.delete(project)
        db.commit()
    return {"ok": True}
