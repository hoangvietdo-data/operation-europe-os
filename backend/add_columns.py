import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "operation_europe.db")
conn = sqlite3.connect(db_path)
c = conn.cursor()

try:
    c.execute("ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1")
    c.execute("ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0")
    c.execute("ALTER TABLE users ADD COLUMN current_frame VARCHAR DEFAULT 'iron_recruit'")
    c.execute("ALTER TABLE users ADD COLUMN unlocked_frames VARCHAR DEFAULT 'iron_recruit'")
    c.execute("ALTER TABLE users ADD COLUMN current_title VARCHAR DEFAULT 'Novice Scholar'")
    conn.commit()
    print("Columns added successfully.")
except Exception as e:
    print(f"Error (maybe columns exist?): {e}")
finally:
    conn.close()
