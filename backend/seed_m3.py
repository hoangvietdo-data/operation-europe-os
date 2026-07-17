from app.db.session import SessionLocal
from app.models.achievement import Achievement
from app.models.project import Project
from app.models.journal import JournalEntry
from app.models.analytics import AnalyticsActivity
import datetime

db = SessionLocal()

# Seed Achievements
ach1 = Achievement(title="First Rejection", description="Got rejected from TUM, but learned to improve my motivation letter.", date_earned=datetime.date(2025, 1, 15))
ach2 = Achievement(title="IELTS 7.5", description="Achieved target band score.", date_earned=datetime.date(2025, 3, 10))
db.add_all([ach1, ach2])

# Seed Projects
proj1 = Project(name="Energy Consumption Predictor", description="Machine learning model predicting household energy use.", progress_percentage=80, url="https://github.com/user/energy-predictor")
proj2 = Project(name="Personal Portfolio", description="Next.js based personal website.", progress_percentage=100, url="https://myportfolio.com")
db.add_all([proj1, proj2])

# Seed Journal
j1 = JournalEntry(title="Why I chose Germany over the UK", content="Tuition is practically free, and the engineering ecosystem is unmatched.", category="Decision")
j2 = JournalEntry(title="Failed my first Mock IELTS", content="Got a 6.0 in writing. Need to study the EuroPass format.", category="Failure")
db.add_all([j1, j2])

# Seed Analytics
a1 = AnalyticsActivity(date=datetime.date(2025, 7, 10), hours_studied=4, applications_sent=0, github_commits=5, streak_count=1)
a2 = AnalyticsActivity(date=datetime.date(2025, 7, 11), hours_studied=6, applications_sent=1, github_commits=2, streak_count=2)
a3 = AnalyticsActivity(date=datetime.date(2025, 7, 12), hours_studied=3, applications_sent=2, github_commits=10, streak_count=3)
db.add_all([a1, a2, a3])

db.commit()
db.close()
print("Milestone 3 Seeded successfully.")
