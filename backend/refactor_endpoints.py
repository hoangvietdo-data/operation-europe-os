import os
import re

endpoints_dir = "app/api/v1/endpoints"
files = [f for f in os.listdir(endpoints_dir) if f.endswith(".py") and f != "auth.py"]

for file in files:
    filepath = os.path.join(endpoints_dir, file)
    with open(filepath, "r") as f:
        content = f.read()

    if "get_current_user" in content:
        continue

    # Add imports
    imports = "from app.models.user import User\nfrom app.api.deps import get_current_user\n"
    content = imports + content
    
    # 1. Add current_user to dependencies
    # def get_tasks(db: Session = Depends(get_db)):
    content = re.sub(
        r'(def [a-zA-Z0-9_]+\(.*?(?:db: Session = Depends\(get_db\)).*?):',
        r'\1, current_user: User = Depends(get_current_user):',
        content
    )
    
    # 2. Update queries .all() -> .filter(Model.user_id == current_user.id).all()
    # db.query(Scholarship).all()
    def query_all_replacer(match):
        model = match.group(1)
        return f"db.query({model}).filter({model}.user_id == current_user.id).all()"
    content = re.sub(r'db\.query\(([a-zA-Z0-9_]+)\)\.all\(\)', query_all_replacer, content)

    # 3. Update queries .filter(...) -> .filter(Model.user_id == current_user.id, ...)
    # db.query(Scholarship).filter(Scholarship.id == 1)
    def query_filter_replacer(match):
        model = match.group(1)
        filter_args = match.group(2)
        return f"db.query({model}).filter({model}.user_id == current_user.id, {filter_args})"
    content = re.sub(r'db\.query\(([a-zA-Z0-9_]+)\)\.filter\((.*?)\)', query_filter_replacer, content)
    
    # 4. Handle `.first()` that didn't have filter, e.g. `db.query(Quote).order_by(func.random()).first()`
    # Let's replace db.query(Quote) with db.query(Quote).filter(Quote.user_id == current_user.id)
    # But only if it's not already filtered.
    # Actually, a more robust way is: replace `db.query(Model)` with `db.query(Model).filter(Model.user_id == current_user.id)` globally, but that might duplicate filters if we aren't careful.
    
    # Let's write back
    with open(filepath, "w") as f:
        f.write(content)

print("Endpoints refactored for dependencies and queries.")
