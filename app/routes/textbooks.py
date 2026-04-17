from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.database import get_db
from app.models.textbook_chunk import TextbookChunk
from app.models.user import User

router = APIRouter()


@router.get("/chunks")
async def get_textbook_chunks(
    subject_id: int = Query(..., description="Subject ID"),
    chapter_name: str | None = Query(None, description="Optional chapter filter"),
    topic_name: str | None = Query(None, description="Optional topic filter"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """
    Read textbook chunks for a subject.
    Accessible to any authenticated user (student or admin).
    """
    stmt = select(TextbookChunk).where(TextbookChunk.subject_id == subject_id)

    if chapter_name:
        stmt = stmt.where(TextbookChunk.chapter_name == chapter_name)
    if topic_name:
        stmt = stmt.where(TextbookChunk.topic_name == topic_name)

    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    rows = result.scalars().all()

    return [
        {
            "chunk_id": r.chunk_id,
            "subject_id": r.subject_id,
            "chapter_name": r.chapter_name,
            "topic_name": r.topic_name,
            "text_content": r.text_content,
            "page_start": r.page_start,
            "page_end": r.page_end,
            "token_count": r.token_count,
            "added_on": r.added_on,
        }
        for r in rows
    ]

