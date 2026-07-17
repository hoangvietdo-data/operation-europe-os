from app.models.user import User
from app.api.deps import get_current_user
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.mission import Mission as MissionModel
from app.models.roadmap import RoadmapNode as RoadmapNodeModel
from app.schemas.mission import Mission, MissionCreate, MissionUpdate

router = APIRouter()

@router.get("/", response_model=List[Mission])
def read_missions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    return db.query(MissionModel).offset(skip).limit(limit).all()

@router.post("/generate", response_model=List[Mission])
def generate_daily_mission(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    # Look for Available RoadmapNodes that don't have a pending mission
    available_nodes = db.query(RoadmapNodeModel).filter(RoadmapNodeModel.user_id == current_user.id, RoadmapNodeModel.status == "Available").all()
    created_missions = []
    
    for node in available_nodes:
        # Check if mission already exists
        existing = db.query(MissionModel).filter(
            MissionModel.roadmap_node_id == node.id,
            MissionModel.status == "Pending"
        ).first()
        
        if not existing:
            new_mission = MissionModel(
                title=f"Complete: {node.title}",
                description=node.description,
                reward_xp=node.reward_xp,
                type="Daily",
                status="Pending",
                roadmap_node_id=node.id
            )
            new_mission.user_id = current_user.id
            db.add(new_mission)
            created_missions.append(new_mission)
            
    db.commit()
    for m in created_missions:
        db.refresh(m)
        
    return created_missions

@router.put("/{id}/complete", response_model=Mission)
def complete_mission(*, db: Session = Depends(get_db), id: int, current_user: User = Depends(get_current_user)) -> Any:
    mission = db.query(MissionModel).filter(MissionModel.user_id == current_user.id, MissionModel.id == id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    mission.status = "Completed"
    mission.user_id = current_user.id
    db.add(mission)
    db.commit()
    db.refresh(mission)
    return mission
