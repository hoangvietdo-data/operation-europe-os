import os

models_dir = "app/models"
files = [f for f in os.listdir(models_dir) if f.endswith(".py") and f not in ["__init__.py", "user.py"]]

for file in files:
    filepath = os.path.join(models_dir, file)
    with open(filepath, "r") as f:
        content = f.read()
    
    # We need to add `user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)`
    # Let's import ForeignKey if not exists.
    if "ForeignKey" not in content:
        content = content.replace("from sqlalchemy import Column, Integer, String", "from sqlalchemy import Column, Integer, String, ForeignKey")
        # Try a more generic replace if the specific one fails
        if "ForeignKey" not in content:
             content = content.replace("from sqlalchemy import Column", "from sqlalchemy import Column, ForeignKey")
    
    new_content = []
    lines = content.split('\n')
    for i, line in enumerate(lines):
        new_content.append(line)
        # Find class definitions and insert user_id after the id column
        if "id = Column(" in line or "id = Column(Integer, primary_key=True" in line:
            indent = line.split("id")[0]
            new_content.append(f'{indent}user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)')
            
    with open(filepath, "w") as f:
        f.write('\n'.join(new_content))

print("Modified all model files.")
