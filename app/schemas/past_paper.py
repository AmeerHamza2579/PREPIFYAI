from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

from app.schemas.past_paper_question import PastPaperQuestionResponse

# Schema for updating an existing past paper
class PastPaperUpdate(BaseModel):
    year: Optional[int] = None
    board: Optional[str] = None

# Schema for returning past paper data, including related questions
class PastPaperResponse(BaseModel):
    paper_id: int
    subject_id: int
    year: int
    board: str
    questions: Optional[List[PastPaperQuestionResponse]] = None

    model_config = ConfigDict(from_attributes=True)
