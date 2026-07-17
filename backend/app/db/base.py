# Import all the models, so that Base has them before being imported by Alembic
from app.db.base_class import Base
from app.models.user import User
from app.models.user_setting import UserSetting
from app.models.university import University
from app.models.scholarship import Scholarship
from app.models.roadmap import RoadmapNode, RoadmapEdge
from app.models.mission import Mission
from app.models.document import Document
from app.models.timeline import TimelineEvent
from app.models.achievement import Achievement
from app.models.project import Project
from app.models.journal import JournalEntry
from app.models.analytics import AnalyticsActivity
from app.models.knowledge import KnowledgeItem
from app.models.news import NewsItem
from app.models.ai_provider import AIProvider
from app.models.dashboard_v2 import Quote, TaskItem, StudySession, DailySummary, XPLog
from app.models.genome import LearningRecord, KnowledgeNode, KnowledgeRelationship, KnowledgeUpdate, HeatmapActivity
