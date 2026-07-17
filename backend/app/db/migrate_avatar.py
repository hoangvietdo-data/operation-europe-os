import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "operation_europe.db")
conn = sqlite3.connect(db_path)
c = conn.cursor()

try:
    c.execute("ALTER TABLE users ADD COLUMN avatar_url VARCHAR DEFAULT 'https://rickandmortyapi.com/api/character/avatar/1.jpeg'")
    conn.commit()
    print("Successfully added avatar_url column")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
