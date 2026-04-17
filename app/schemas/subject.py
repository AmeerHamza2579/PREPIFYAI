
from pydantic import BaseModel, ConfigDict
from typing import Optional

class SubjectBase(BaseModel):
    class_level: str
    board: str
    subject_name: str
    book_version: str

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    book_version: Optional[str] = None

class SubjectResponse(SubjectBase):
    subject_id: int

    model_config = ConfigDict(from_attributes=True)
