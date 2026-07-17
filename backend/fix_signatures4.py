import os
import re

endpoints_dir = "app/api/v1/endpoints"
files = ["dashboard.py", "documents.py", "roadmap.py", "settings.py"]

for file in files:
    filepath = os.path.join(endpoints_dir, file)
    with open(filepath, "r") as f:
        content = f.read()

    # match: var_name, current_user: User = Depends(get_current_user): var_type
    def replacer(match):
        var_name = match.group(1)
        var_type = match.group(2)
        return f"{var_name}: {var_type}, current_user: User = Depends(get_current_user)"

    content = re.sub(
        r'([a-zA-Z0-9_]+),\s*current_user:\s*User\s*=\s*Depends\(get_current_user\):\s*([a-zA-Z0-9_\[\]]+)',
        replacer,
        content
    )

    with open(filepath, "w") as f:
        f.write(content)

print("Fixed remaining syntax errors.")
