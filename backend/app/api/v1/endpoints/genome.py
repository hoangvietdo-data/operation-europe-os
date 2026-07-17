from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
import datetime
import random

from app.db.session import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.models.genome import LearningRecord, KnowledgeNode, KnowledgeRelationship, KnowledgeUpdate, HeatmapActivity
from app.schemas.genome import LearningRecordCreate, LearningRecord as LearningRecordSchema, GraphData

router = APIRouter()

def mock_ai_extraction(evidence: LearningRecordCreate):
    # Dynamic heuristic extraction since no API key is available
    desc = evidence.description.lower()
    title = evidence.title.lower()
    full_text = f"{title} {desc}"
    
    # Simple stop words
    stop_words = {"và", "các", "những", "là", "của", "cho", "để", "với", "trong", "ngoài", "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", "about"}
    words = [w.strip(".,!?()[]{}") for w in full_text.split() if w.strip(".,!?()[]{}") not in stop_words and len(w) > 2]
    
    # Capitalize for node names
    words = [w.capitalize() for w in words]
    
    nodes = []
    relationships = []
    
    if not words:
        return {"nodes": [], "relationships": []}
        
    # Pick the most prominent word as Domain (e.g., first word of title)
    domain_name = evidence.title.split()[0].capitalize() if evidence.title else "Knowledge"
    nodes.append({"name": domain_name, "node_type": "domain", "score_boost": 2, "xp_boost": 10, "confidence_boost": 2, "description": "Auto-detected domain"})
    
    # Pick next few as skills/concepts
    skills = list(set(words[:5])) # Unique first 5 words
    for s in skills:
        if s != domain_name:
            nodes.append({"name": s, "node_type": "skill", "score_boost": 5, "xp_boost": 25, "confidence_boost": 5, "description": "Auto-detected skill"})
            relationships.append({"source_name": s, "target_name": domain_name, "relation_type": "belongs_to"})
            
    # Add one concept from description if available
    if len(words) > 5:
        concept = words[5]
        nodes.append({"name": concept, "node_type": "concept", "score_boost": 3, "xp_boost": 15, "confidence_boost": 3, "description": "Auto-detected concept"})
        if skills:
            relationships.append({"source_name": concept, "target_name": skills[0], "relation_type": "belongs_to"})
            
    return {"nodes": nodes, "relationships": relationships}

@router.get("/graph", response_model=GraphData)
def get_knowledge_graph(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    nodes = db.query(KnowledgeNode).filter(KnowledgeNode.user_id == current_user.id).all()
    rels = db.query(KnowledgeRelationship).join(KnowledgeNode, KnowledgeRelationship.source_id == KnowledgeNode.id).filter(KnowledgeNode.user_id == current_user.id).all()
    
    graph_nodes = []
    
    for n in nodes:
        # Val affects size in react-force-graph. Domains are HUGE (bubbles), skills medium, concepts small.
        val = 5
        if n.node_type == 'domain': val = 30
        elif n.node_type == 'skill': val = 15
        elif n.node_type == 'concept': val = 8
        elif n.node_type == 'thinking_pattern': val = 8
        
        graph_nodes.append({
            "id": str(n.id),
            "name": n.name,
            "val": val,
            "group": n.node_type,
            "score": n.score,
            "xp": n.xp,
            "confidence": n.confidence
        })

    graph_links = []
    for r in rels:
        graph_links.append({
            "source": str(r.source_id),
            "target": str(r.target_id),
            "label": r.relation_type
        })
        
    return {"nodes": graph_nodes, "links": graph_links}

@router.post("/record", response_model=LearningRecordSchema)
def submit_record(*, db: Session = Depends(get_db), record_in: LearningRecordCreate, current_user: User = Depends(get_current_user)):
    # 1. Save Record
    record = LearningRecord(**record_in.model_dump())
    record.user_id = current_user.id
    db.add(record)
    db.commit()
    db.refresh(record)
    
    # 2. Process with AI Engine
    extraction = mock_ai_extraction(record_in)
    
    node_map = {} # name to id
    
    # 3. Create or Update Nodes
    for n_data in extraction["nodes"]:
        name = n_data["name"]
        node = db.query(KnowledgeNode).filter(KnowledgeNode.user_id == current_user.id, KnowledgeNode.name == name).first()
        if not node:
            node = KnowledgeNode(
                user_id=current_user.id,
                node_type=n_data["node_type"],
                name=name,
                description=n_data["description"]
            )
            db.add(node)
            db.commit()
            db.refresh(node)
            
        # Update scores
        node.score = min(100.0, node.score + n_data["score_boost"])
        node.xp += n_data["xp_boost"]
        node.confidence = min(100, node.confidence + n_data["confidence_boost"])
        node.evidence_count += 1
        node.last_updated = datetime.datetime.utcnow()
        db.commit()
        
        # Track history
        update_log = KnowledgeUpdate(node_id=node.id, record_id=record.id, xp_added=n_data["xp_boost"], score_added=n_data["score_boost"])
        db.add(update_log)
        db.commit()
        
        node_map[name] = node.id
        
    # 4. Create Relationships
    for r_data in extraction["relationships"]:
        source_id = node_map.get(r_data["source_name"])
        target_id = node_map.get(r_data["target_name"])
        if source_id and target_id:
            # Check if exists
            exists = db.query(KnowledgeRelationship).filter(
                KnowledgeRelationship.source_id == source_id,
                KnowledgeRelationship.target_id == target_id,
                KnowledgeRelationship.relation_type == r_data["relation_type"]
            ).first()
            if not exists:
                rel = KnowledgeRelationship(source_id=source_id, target_id=target_id, relation_type=r_data["relation_type"])
                db.add(rel)
                db.commit()
                
    # 5. Log Heatmap Activity
    today_str = datetime.date.today().isoformat()
    heatmap = db.query(HeatmapActivity).filter(HeatmapActivity.user_id == current_user.id, HeatmapActivity.date == today_str).first()
    if heatmap:
        heatmap.intensity = min(4, heatmap.intensity + 1)
    else:
        heatmap = HeatmapActivity(user_id=current_user.id, date=today_str, intensity=1)
        db.add(heatmap)
    db.commit()

    db.refresh(record)
    return record

@router.delete("/node/{node_id}")
def delete_node(node_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    node = db.query(KnowledgeNode).filter(KnowledgeNode.id == node_id, KnowledgeNode.user_id == current_user.id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
        
    # The relationships will be cascaded by DB or we can manually delete them
    db.query(KnowledgeRelationship).filter(
        (KnowledgeRelationship.source_id == node_id) | (KnowledgeRelationship.target_id == node_id)
    ).delete()
    
    db.delete(node)
    db.commit()
    return {"status": "success"}
