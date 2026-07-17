import os
import re

endpoints_dir = "app/api/v1/endpoints"
files = [f for f in os.listdir(endpoints_dir) if f.endswith(".py") and f != "auth.py"]

for file in files:
    filepath = os.path.join(endpoints_dir, file)
    with open(filepath, "r") as f:
        content = f.read()

    # match: func_in, current_user: User = Depends(get_current_user): FuncCreate) -> Any:
    def replacer(match):
        var_in = match.group(1)
        type_in = match.group(2)
        ret_type = match.group(3)
        return f"{var_in}: {type_in}, current_user: User = Depends(get_current_user)) -> {ret_type}:"

    content = re.sub(
        r'([a-zA-Z0-9_]+),\s*current_user:\s*User\s*=\s*Depends\(get_current_user\):\s*([a-zA-Z0-9_\[\]]+)\)\s*->\s*([a-zA-Z0-9_\[\]]+):',
        replacer,
        content
    )

    # What if there is no -> Any: ? 
    # Let's check for those too
    def replacer2(match):
        var_in = match.group(1)
        type_in = match.group(2)
        return f"{var_in}: {type_in}, current_user: User = Depends(get_current_user)):"

    content = re.sub(
        r'([a-zA-Z0-9_]+),\s*current_user:\s*User\s*=\s*Depends\(get_current_user\):\s*([a-zA-Z0-9_\[\]]+)\):',
        replacer2,
        content
    )

    # What if type hint was dict? (like dict)
    
    with open(filepath, "w") as f:
        f.write(content)

print("Fixed syntax errors.")
