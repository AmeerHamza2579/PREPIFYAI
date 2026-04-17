from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class PastPaperQuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    embedding: Optional[List[float]] = None
    topic: Optional[str] = None
    marks: Optional[float] = None

# Response schema
class PastPaperQuestionResponse(BaseModel):
    question_id: int
    question_text: str
    question_type: str
    topic: Optional[str] = None
    marks: Optional[float] = None
    embedding: Optional[List[float]] = None

    model_config = ConfigDict(from_attributes=True)