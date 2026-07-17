from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Mission(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    reward_xp = Column(Integer, default=100)
    type = Column(String, default="Daily") # Daily, Weekly
    status = Column(String, default="Pending") # Pending, Completed, Failed
    roadmap_node_id = Column(Integer, ForeignKey("roadmap_nodes.id"), nullable=True)

    roadmap_node = relationship("RoadmapNode", back_populates="missions")
