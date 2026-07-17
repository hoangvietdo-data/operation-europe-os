import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "operation_europe.db")
conn = sqlite3.connect(db_path)
c = conn.cursor()

try:
    c.execute("DELETE FROM projects;")
    c.execute("DELETE FROM documents;")
    c.execute("DELETE FROM scholarships;")
    c.execute("DELETE FROM study_sessions;")
    c.execute("DELETE FROM daily_summaries;")
    c.execute("DELETE FROM tasks;")
    conn.commit()
    print("Seed data successfully cleared.")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
