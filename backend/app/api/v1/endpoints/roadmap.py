from app.models.user import User
from app.api.deps import get_current_user
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.roadmap import RoadmapNode as RoadmapNodeModel, RoadmapEdge as RoadmapEdgeModel
from app.schemas.roadmap import RoadmapNode, RoadmapNodeCreate, RoadmapNodeUpdate, RoadmapEdge, RoadmapEdgeCreate

router = APIRouter()

@router.get("/nodes", response_model=List[RoadmapNode])
def read_nodes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    return db.query(RoadmapNodeModel).offset(skip).limit(limit).all()

@router.post("/nodes", response_model=RoadmapNode)
def create_node(*, db: Session = Depends(get_db), node_in: RoadmapNodeCreate, current_user: User = Depends(get_current_user)) -> Any:
    node = RoadmapNodeModel(**node_in.model_dump())
    node.user_id = current_user.id
    db.add(node)
    db.commit()
    db.refresh(node)
    return node

@router.put("/nodes/{id}", response_model=RoadmapNode)
def update_node(*, db: Session = Depends(get_db), id: int, current_user: User = Depends(get_current_user), node_in: RoadmapNodeUpdate) -> Any:
    node = db.query(RoadmapNodeModel).filter(RoadmapNodeModel.user_id == current_user.id, RoadmapNodeModel.id == id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    update_data = node_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(node, field, value)
        
    node.user_id = current_user.id
    db.add(node)
    db.commit()
    db.refresh(node)
    
    # Simple dependency resolution logic:
    # If node is marked "Completed", check all edges where source_node_id == node.id
    # If all prerequisites for target_node are completed, set target_node to "Available"
    if node.status == "Completed":
        edges = db.query(RoadmapEdgeModel).filter(RoadmapEdgeModel.user_id == current_user.id, RoadmapEdgeModel.source_node_id == node.id).all()
        for edge in edges:
            target = db.query(RoadmapNodeModel).filter(RoadmapNodeModel.user_id == current_user.id, RoadmapNodeModel.id == edge.target_node_id).first()
            if target and target.status == "Locked":
                # Check if ALL prerequisites for this target are completed
                prereq_edges = db.query(RoadmapEdgeModel).filter(RoadmapEdgeModel.user_id == current_user.id, RoadmapEdgeModel.target_node_id == target.id).all()
                all_completed = True
                for pre in prereq_edges:
                    pre_node = db.query(RoadmapNodeModel).filter(RoadmapNodeModel.user_id == current_user.id, RoadmapNodeModel.id == pre.source_node_id).first()
                    if pre_node and pre_node.status != "Completed":
                        all_completed = False
                        break
                if all_completed:
                    target.status = "Available"
                    target.user_id = current_user.id
                    db.add(target)
        db.commit()
        
    return node

@router.get("/edges", response_model=List[RoadmapEdge])
def read_edges(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    return db.query(RoadmapEdgeModel).offset(skip).limit(limit).all()

@router.post("/edges", response_model=RoadmapEdge)
def create_edge(*, db: Session = Depends(get_db), edge_in: RoadmapEdgeCreate, current_user: User = Depends(get_current_user)) -> Any:
    edge = RoadmapEdgeModel(**edge_in.model_dump())
    edge.user_id = current_user.id
    db.add(edge)
    db.commit()
    db.refresh(edge)
    return edge
