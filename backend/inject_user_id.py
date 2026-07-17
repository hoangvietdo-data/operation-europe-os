import os
import re

endpoints_dir = "app/api/v1/endpoints"
files = [f for f in os.listdir(endpoints_dir) if f.endswith(".py") and f != "auth.py"]

for file in files:
    filepath = os.path.join(endpoints_dir, file)
    with open(filepath, "r") as f:
        content = f.read()

    lines = content.split("\n")
    new_lines = []
    
    for i, line in enumerate(lines):
        # Patch db.add(obj)
        match = re.search(r'^(\s*)db\.add\(([a-zA-Z0-9_]+)\)', line)
        if match:
            indent = match.group(1)
            var_name = match.group(2)
            # Avoid injecting multiple times or injecting for settings/something weird if needed, 
            # but all models have user_id now.
            if var_name not in ["settings"]: # Wait, settings has user_id too!
                new_lines.append(f"{indent}{var_name}.user_id = current_user.id")
            elif var_name == "settings":
                 new_lines.append(f"{indent}{var_name}.user_id = current_user.id")
                 
        # Patch db.query(Model).get(id) -> db.query(Model).filter(Model.id == id, Model.user_id == current_user.id).first()
        # This is harder with regex, let's just do a simple replacement for .get(task_id) etc.
        get_match = re.search(r'db\.query\(([a-zA-Z0-9_]+)\)\.get\(([a-zA-Z0-9_]+)\)', line)
        if get_match:
            model = get_match.group(1)
            var_id = get_match.group(2)
            line = line.replace(
                f"db.query({model}).get({var_id})", 
                f"db.query({model}).filter({model}.id == {var_id}, {model}.user_id == current_user.id).first()"
            )

        new_lines.append(line)
        
    with open(filepath, "w") as f:
        f.write("\n".join(new_lines))

print("Injected user_id into creations and gets.")
