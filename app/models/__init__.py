# app/models/__init__.py

# Import all models here
from .user import User
from .student_performance import StudentPerformance
from .feedback import Feedback
from .generated_question import GeneratedQuestion
from .subject import Subject
from .past_paper import PastPaper
from .prediction import Prediction
from .textbook_chunk import TextbookChunk
from .past_paper_question import PastPaperQuestion
from .user_gamification import UserGamification

__all__ = [
    "User",
    "StudentPerformance",
    "Feedback",
    "GeneratedQuestion",
    "Subject",
    "PastPaper",
    "Prediction",
    "TextbookChunk",
    "PastPaperQuestion",
    "UserGamification",
]