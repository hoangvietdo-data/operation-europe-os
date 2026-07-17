from app.db.session import SessionLocal
from app.models.knowledge import KnowledgeItem
from app.models.news import NewsItem
import datetime

db = SessionLocal()

# Seed Knowledge Base
k1 = KnowledgeItem(title="Erasmus Mundus Catalogue", url="https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en", tags="official, scholarship", notes="The primary list of all joint master degrees. Check deadlines around October.")
k2 = KnowledgeItem(title="DAAD Scholarship Database", url="https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/", tags="germany, funding", notes="Filter by Engineering. Many require 2 years of work experience.")
k3 = KnowledgeItem(title="Motivation Letter Structure", tags="guide, writing", notes="1. Hook (Why this field). 2. Academic Background. 3. Professional Experience. 4. Why this specific university. 5. Future Goals.")
db.add_all([k1, k2, k3])

# Seed Newsletter
n1 = NewsItem(headline="Eiffel Excellence Scholarship Program Opens", summary="The French Ministry for Europe and Foreign Affairs has opened the call for applications for the Eiffel Excellence Scholarship Program.", source="Campus France", url="https://www.campusfrance.org", date_published=datetime.date.today())
n2 = NewsItem(headline="Chevening Applications Approaching Deadline", summary="UK's fully-funded scholarship applications will close in 2 weeks. Ensure your references are submitted.", source="Chevening.org", date_published=datetime.date.today() - datetime.timedelta(days=2))
n3 = NewsItem(headline="New Joint Master in Sustainable AI announced", summary="A new Erasmus+ program between TU Berlin, KTH, and Politecnico di Milano will start accepting applications next month.", source="Erasmus+ News", date_published=datetime.date.today() - datetime.timedelta(days=5))
db.add_all([n1, n2, n3])

db.commit()
db.close()
print("Milestone 4 Seeded successfully.")
