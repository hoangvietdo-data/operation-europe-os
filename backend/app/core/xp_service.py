from sqlalchemy.orm import Session
from app.models.user import User

# Define the Frame rewards at specific levels
LEVEL_THRESHOLDS = {
    1: {"frame": "iron_recruit", "title": "Novice Scholar"},
    5: {"frame": "bronze_scholar", "title": "Ambitious Learner"},
    10: {"frame": "silver_specialist", "title": "Dedicated Student"},
    25: {"frame": "gold_achiever", "title": "Golden Mind"},
    50: {"frame": "platinum_visionary", "title": "Visionary Thinker"},
    100: {"frame": "diamond_master", "title": "Master of Knowledge"},
    200: {"frame": "master_sage", "title": "Sage of Wisdom"},
    300: {"frame": "grandmaster_luminary", "title": "Luminary Mind"},
    400: {"frame": "challenger_apex", "title": "Apex Scholar"},
    500: {"frame": "legendary_sovereign", "title": "Legendary Sovereign"}
}

# Auto-generate prestige frames every 10 levels from 110 to 490
for lvl in range(110, 500, 10):
    if lvl not in LEVEL_THRESHOLDS:
        title_base = ""
        if lvl < 200: title_base = "Diamond"
        elif lvl < 300: title_base = "Master"
        elif lvl < 400: title_base = "Grandmaster"
        else: title_base = "Challenger"
        
        LEVEL_THRESHOLDS[lvl] = {
            "frame": f"prestige_{lvl}",
            "title": f"{title_base} Prestige {lvl}"
        }

def get_total_xp_for_level(level: int) -> int:
    """Returns the total XP required to reach the given level."""
    if level <= 1:
        return 0
    # League of Legends style XP curve: Level N+1 takes 280 + (N-1)*100 XP
    n = level - 1
    return n * 280 + 100 * n * (n - 1) // 2

def calculate_level(xp: int) -> int:
    level = 1
    while True:
        if xp >= get_total_xp_for_level(level + 1):
            level += 1
        else:
            break
    return level

def add_xp(db: Session, user: User, amount: int) -> dict:
    """
    Adds XP to a user and returns a dict containing level up info if applicable.
    """
    old_level = user.level
    user.xp += amount
    new_level = calculate_level(user.xp)
    
    level_up_info = None
    
    if new_level > old_level:
        user.level = new_level
        
        # Check if we unlocked any new frames
        unlocked_frames = user.unlocked_frames.split(",") if user.unlocked_frames else []
        new_unlocked = []
        
        for req_level, rewards in sorted(LEVEL_THRESHOLDS.items()):
            if old_level < req_level <= new_level:
                frame_id = rewards["frame"]
                if frame_id not in unlocked_frames:
                    unlocked_frames.append(frame_id)
                    new_unlocked.append(frame_id)
                    # Optionally auto-equip
                    user.current_frame = frame_id
                    user.current_title = rewards["title"]
                    
        user.unlocked_frames = ",".join(unlocked_frames)
        
        level_up_info = {
            "old_level": old_level,
            "new_level": new_level,
            "new_frames_unlocked": new_unlocked,
            "current_frame": user.current_frame,
            "current_title": user.current_title
        }
        
    db.commit()
    db.refresh(user)
    
    return level_up_info
