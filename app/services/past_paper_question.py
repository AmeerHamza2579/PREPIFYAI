import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.past_paper_question import PastPaperQuestion
from app.schemas.past_paper_question import PastPaperQuestionUpdate
from app.core.embedding_storage import embedding_to_storage_format
import logging

logger = logging.getLogger(__name__)


# --- Get all ---
async def get_all_past_paper_questions(db: AsyncSession):
    """Get all past paper questions"""
    stmt = select(PastPaperQuestion)
    result = await db.execute(stmt)
    return result.scalars().all()


# --- Get by ID ---
async def get_past_paper_question_by_id(db: AsyncSession, question_id: int):
    """Get question by ID"""
    stmt = select(PastPaperQuestion).where(PastPaperQuestion.question_id == question_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


# --- Update ---
async def update_past_paper_question(
    db: AsyncSession, 
    question_id: int, 
    updates: PastPaperQuestionUpdate
):
    """Update a question"""
    stmt = select(PastPaperQuestion).where(PastPaperQuestion.question_id == question_id)
    result = await db.execute(stmt)
    question = result.scalar_one_or_none()
    
    if not question:
        return None
    
    # Update fields
    if updates.question_text:
        question.question_text = updates.question_text
    if updates.question_type:
        question.question_type = updates.question_type
    if updates.embedding:
        # Convert to storage format (pgvector or JSON)
        question.embedding = embedding_to_storage_format(updates.embedding)
    if hasattr(updates, "topic") and updates.topic:
        question.topic = updates.topic
    if hasattr(updates, "marks") and updates.marks:
        question.marks = updates.marks
    
    await db.commit()
    await db.refresh(question)
    return question


# --- Delete ---
async def delete_past_paper_question(db: AsyncSession, question_id: int):
    """Delete a question"""
    stmt = select(PastPaperQuestion).where(PastPaperQuestion.question_id == question_id)
    result = await db.execute(stmt)
    question = result.scalar_one_or_none()
    
    if not question:
        return None
    
    await db.delete(question)
    await db.commit()
    return question