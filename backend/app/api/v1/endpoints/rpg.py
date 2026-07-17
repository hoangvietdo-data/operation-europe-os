from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.core.xp_service import LEVEL_THRESHOLDS, add_xp, get_total_xp_for_level
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class FrameEquipRequest(BaseModel):
    frame_id: str

class AddXPRequest(BaseModel):
    amount: int

class AvatarUpdateRequest(BaseModel):
    avatar_url: str

@router.get("/profile")
def get_rpg_profile(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "level": current_user.level,
        "xp": current_user.xp,
        "avatar_url": current_user.avatar_url,
        "current_frame": current_user.current_frame,
        "unlocked_frames": current_user.unlocked_frames.split(",") if current_user.unlocked_frames else [],
        "current_title": current_user.current_title,
        "current_level_xp": get_total_xp_for_level(current_user.level),
        "next_level_xp": get_total_xp_for_level(current_user.level + 1)
    }

@router.post("/equip")
def equip_frame(req: FrameEquipRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    unlocked = current_user.unlocked_frames.split(",") if current_user.unlocked_frames else []
    if req.frame_id not in unlocked:
        raise HTTPException(status_code=400, detail="Frame not unlocked yet")
        
    current_user.current_frame = req.frame_id
    db.commit()
    return {"status": "success", "current_frame": current_user.current_frame}

@router.post("/add_xp")
def admin_add_xp(req: AddXPRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """A helper endpoint for testing the leveling system directly."""
    result = add_xp(db, current_user, req.amount)
    return {
        "level_up_info": result,
        "current_xp": current_user.xp,
        "current_level": current_user.level
    }

@router.post("/reset")
def reset_rpg_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Resets user XP, level, and unlocked frames."""
    current_user.level = 1
    current_user.xp = 0
    current_user.current_frame = "iron_recruit"
    current_user.unlocked_frames = "iron_recruit"
    current_user.current_title = "Novice Scholar"
    db.commit()
    return {"status": "success", "message": "Progress reset"}

@router.post("/avatar")
def update_avatar(req: AvatarUpdateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Updates the user's avatar url."""
    current_user.avatar_url = req.avatar_url
    db.commit()
    return {"status": "success", "avatar_url": current_user.avatar_url}

@router.get("/collection")
def get_frame_collection(current_user: User = Depends(get_current_user)):
    unlocked = current_user.unlocked_frames.split(",") if current_user.unlocked_frames else []
    collection = []
    
    for req_level, data in sorted(LEVEL_THRESHOLDS.items()):
        fid = data["frame"]
        collection.append({
            "id": fid,
            "title": data["title"],
            "required_level": req_level,
            "is_unlocked": fid in unlocked,
            "is_equipped": current_user.current_frame == fid
        })
        
    return {"collection": collection}
