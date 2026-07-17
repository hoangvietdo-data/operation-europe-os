import os
import re

endpoints_dir = "app/api/v1/endpoints"
files = [f for f in os.listdir(endpoints_dir) if f.endswith(".py") and f != "auth.py"]

for file in files:
    filepath = os.path.join(endpoints_dir, file)
    with open(filepath, "r") as f:
        content = f.read()

    # The broken syntax is: ...) -> Any, current_user: User = Depends(get_current_user):
    # Or ...) -> Scholarship, current_user: User = Depends(get_current_user):
    # It should be: ..., current_user: User = Depends(get_current_user)) -> Any:

    # 1. We look for:
    # def func_name(..., db: Session = Depends(get_db)) -> Type, current_user...:
    # Let's just fix it by moving the `, current_user...` before `) ->`
    
    # Actually, a simpler way is to just replace the broken part:
    # Match: db: Session = Depends(get_db)) -> ([a-zA-Z0-9_\[\]]+), current_user: User = Depends(get_current_user):
    # Replace: db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> \1:
    
    def replacer(match):
        return f"db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> {match.group(1)}:"

    content = re.sub(
        r'db:\s*Session\s*=\s*Depends\(get_db\)\s*\)\s*->\s*([a-zA-Z0-9_\[\]]+)\s*,\s*current_user:\s*User\s*=\s*Depends\(get_current_user\):',
        replacer,
        content
    )
    
    # What about those without return type?
    # def read_scholarships(..., db: Session = Depends(get_db)), current_user: User = Depends(get_current_user):
    # Match: db: Session = Depends(get_db)), current_user: User = Depends(get_current_user):
    # Replace: db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    
    def replacer2(match):
        return f"db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):"

    content = re.sub(
        r'db:\s*Session\s*=\s*Depends\(get_db\)\)\s*,\s*current_user:\s*User\s*=\s*Depends\(get_current_user\):',
        replacer2,
        content
    )

    with open(filepath, "w") as f:
        f.write(content)

print("Fixed signatures.")
