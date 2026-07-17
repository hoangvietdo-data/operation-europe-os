import os

models_dir = "app/models"
files = [f for f in os.listdir(models_dir) if f.endswith(".py") and f != "user.py"]

for file in files:
    filepath = os.path.join(models_dir, file)
    with open(filepath, "r") as f:
        lines = f.readlines()
    
    new_lines = []
    for line in lines:
        if "_user_id = Column" not in line:
            new_lines.append(line)
            
    with open(filepath, "w") as f:
        f.write("".join(new_lines))

print("Fixed incorrect columns.")
