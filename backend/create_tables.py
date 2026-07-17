import sys
import os

# Add the app directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine
from app.db.base import Base

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Done!")
