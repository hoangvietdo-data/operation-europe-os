import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "operation_europe.db")
conn = sqlite3.connect(db_path)
c = conn.cursor()

try:
    c.execute("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1")
    c.execute("ALTER TABLE users ADD COLUMN is_superuser BOOLEAN DEFAULT 0")
    conn.commit()
    print("Columns added successfully.")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
