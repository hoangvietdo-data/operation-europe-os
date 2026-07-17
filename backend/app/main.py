from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.db.session import engine
from app.db.base_class import Base

# Import all models so they register with Base.metadata
from app.models.user import User
from app.models.user_setting import UserSetting
from app.models.scholarship import Scholarship
from app.models.university import University
from app.models.roadmap import RoadmapNode, RoadmapEdge
from app.models.document import Document
from app.models.timeline import TimelineEvent
from app.models.achievement import Achievement
from app.models.project import Project
from app.models.journal import JournalEntry
from app.models.analytics import AnalyticsActivity
from app.models.knowledge import KnowledgeItem
from app.models.news import NewsItem
from app.models.ai_provider import AIProvider
from app.models.quote import Quote
from app.models.task import Task
from app.models.study_session import StudySession
from app.models.daily_summary import DailySummary
from app.models.xp_log import XPLog
from app.models.learning_record import LearningRecord
from app.models.knowledge_node import KnowledgeNode
from app.models.heatmap_activity import HeatmapActivity
from app.models.mission import Mission
from app.models.knowledge_relationship import KnowledgeRelationship
from app.models.knowledge_update import KnowledgeUpdate

app = FastAPI(title="Operation Europe OS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto-create all tables on startup
@app.on_event("startup")
def on_startup():
    print("Creating database tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    print("Database tables ready!")

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to Operation Europe OS API"}
