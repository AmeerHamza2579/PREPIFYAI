from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.core.security import require_admin
from app.models.user import User
from app.schemas.past_paper_question import (
    PastPaperQuestionUpdate,
    PastPaperQuestionResponse,
)
from app.services.past_paper_question import (
    get_all_past_paper_questions,
    get_past_paper_question_by_id,
    update_past_paper_question,
    delete_past_paper_question,
)

router = APIRouter()


# --- Read all ---
@router.get("/", response_model=List[PastPaperQuestionResponse])
async def get_all_questions(db: AsyncSession = Depends(get_db)):
    """Get all past paper questions"""
    return await get_all_past_paper_questions(db)


# --- Read by ID ---
@router.get("/{question_id}", response_model=PastPaperQuestionResponse)
async def get_question(
    question_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific past paper question"""
    question = await get_past_paper_question_by_id(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


# --- Update ---
@router.put("/{question_id}", response_model=PastPaperQuestionResponse)
async def update_question(
    question_id: int,
    updates: PastPaperQuestionUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Update a past paper question (admin only)."""
    question = await update_past_paper_question(db, question_id, updates)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


# --- Delete ---
@router.delete("/{question_id}")
async def delete_question(
    question_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Delete a past paper question (admin only)."""
    question = await delete_past_paper_question(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted successfully"}