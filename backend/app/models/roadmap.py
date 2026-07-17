from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class RoadmapNode(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    estimated_hours = Column(Integer, default=0)
    difficulty = Column(String, default="Medium")
    reward_xp = Column(Integer, default=100)
    status = Column(String, default="Locked") # Locked, Available, In Progress, Completed
    type = Column(String, default="Task") # Task, Evaluation, Milestone

    missions = relationship("Mission", back_populates="roadmap_node")

class RoadmapEdge(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    source_node_id = Column(Integer, ForeignKey("roadmap_nodes.id"), nullable=False)
    target_node_id = Column(Integer, ForeignKey("roadmap_nodes.id"), nullable=False)
