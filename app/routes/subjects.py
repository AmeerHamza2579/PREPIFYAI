from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.schemas.subject import SubjectResponse, SubjectCreate, SubjectUpdate
from app.models.subject import Subject
from app.models.user import User
from app.core.security import get_current_user, require_admin_user
from app.core.redis_cache import cache_get_json, cache_set_json

router = APIRouter()

@router.get("/", response_model=List[SubjectResponse])
async def get_subjects(
    class_level: Optional[str] = None,
    board: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of subjects with optional filters.
    
    - **class_level**: Filter by class ('9', '10', '11', '12')
    - **board**: Filter by board (e.g., 'FBISE', 'Punjab Board')
    """
    cache_key = f"subjects:v1:{class_level or '*'}:{board or '*'}"
    cached = cache_get_json(cache_key)
    if isinstance(cached, list):
        return [SubjectResponse(**row) for row in cached]

    query = select(Subject)
    
    if class_level:
        query = query.where(Subject.class_level == class_level)
    if board:
        query = query.where(Subject.board == board)
    
    result = await db.execute(query)
    subjects = result.scalars().all()
    rows = [SubjectResponse.model_validate(s).model_dump() for s in subjects]
    cache_set_json(cache_key, rows, ttl_seconds=180)
    return subjects

@router.get("/{subject_id}", response_model=SubjectResponse)
async def get_subject(
    subject_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get subject by ID."""
    result = await db.execute(
        select(Subject).where(Subject.subject_id == subject_id)
    )
    subject = result.scalar_one_or_none()
    
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    return subject

@router.post("/", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_subject(
    subject_data: SubjectCreate,
    _admin: User = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new subject (Admin only).
    
    - **class_level**: Class level ('9', '10', '11', '12')
    - **board**: Board name (e.g., 'FBISE')
    - **subject_name**: Subject name (e.g., 'Biology')
    - **book_version**: Book version year (e.g., '2024')
    """
    db_subject = Subject(**subject_data.model_dump())
    db.add(db_subject)
    await db.commit()
    await db.refresh(db_subject)
    return db_subject

@router.put("/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    subject_id: int,
    subject_data: SubjectUpdate,
    _admin: User = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update subject (Admin only)."""
    result = await db.execute(
        select(Subject).where(Subject.subject_id == subject_id)
    )
    subject = result.scalar_one_or_none()
    
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    update_data = subject_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(subject, field, value)
    
    await db.commit()
    await db.refresh(subject)
    return subject

@router.delete("/{subject_id}")
async def delete_subject(
    subject_id: int,
    _admin: User = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete subject (Admin only)."""
    result = await db.execute(
        select(Subject).where(Subject.subject_id == subject_id)
    )
    subject = result.scalar_one_or_none()
    
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    await db.delete(subject)
    await db.commit()
    
    return {"message": "Subject deleted successfully"}
