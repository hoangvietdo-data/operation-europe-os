from app.db.session import SessionLocal
from app.models.roadmap import RoadmapNode, RoadmapEdge
from app.models.mission import Mission # Import to fix SQLAlchemy registry

db = SessionLocal()

node1 = RoadmapNode(title="Pass IELTS Exam", description="Achieve a score of 7.5 or higher.", estimated_hours=100, difficulty="Hard", reward_xp=500, status="Available", type="Milestone")
node2 = RoadmapNode(title="Draft CV", description="Create a EuroPass format CV.", estimated_hours=10, difficulty="Medium", reward_xp=200, status="Locked", type="Task")
node3 = RoadmapNode(title="Draft Motivation Letter", description="Tailor the letter to target universities.", estimated_hours=20, difficulty="Hard", reward_xp=300, status="Locked", type="Task")

db.add_all([node1, node2, node3])
db.commit()
db.refresh(node1)
db.refresh(node2)
db.refresh(node3)

edge1 = RoadmapEdge(source_node_id=node1.id, target_node_id=node2.id)
edge2 = RoadmapEdge(source_node_id=node2.id, target_node_id=node3.id)
db.add_all([edge1, edge2])
db.commit()
db.close()
print("Seeded successfully.")
