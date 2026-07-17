import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "operation_europe.db")
conn = sqlite3.connect(db_path)
c = conn.cursor()

try:
    c.execute("ALTER TABLE users ADD COLUMN readiness_data TEXT")
    conn.commit()
    print("Successfully added readiness_data column")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
