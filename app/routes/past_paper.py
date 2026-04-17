# routes/past_paper.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.schemas.past_paper import PastPaperResponse, PastPaperUpdate
from app.services.past_paper import PastPaperService

router = APIRouter()


# ============================================================================
# GET PAST PAPERS
# ============================================================================

@router.get("/", response_model=List[PastPaperResponse])
async def  get_all_past_papers(
    subject_id: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """
    Get all past papers with optional filters.
    
    Query Parameters:
    - subject_id: Filter by subject
    - year: Filter by year
    
    Example: GET /past-papers?subject_id=1&year=2024
    """
    return await PastPaperService.get_all_past_papers(db, subject_id, year)


@router.get("/{paper_id}", response_model=PastPaperResponse)
async def  get_past_paper(
    paper_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """Get a specific past paper by ID"""
    paper = PastPaperService.get_past_paper_by_id(db, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Past paper not found")
    return await paper


# ============================================================================
# UPDATE PAST PAPER
# ============================================================================

@router.put("/{paper_id}", response_model=PastPaperResponse)
async def  update_past_paper(
    paper_id: int,
    updates: PastPaperUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Update a past paper (admin only)."""
    paper = PastPaperService.update_past_paper(db, paper_id, updates)
    if not paper:
        raise HTTPException(status_code=404, detail="Past paper not found")
    return await paper


# ============================================================================
# DELETE PAST PAPER
# ============================================================================

@router.delete("/{paper_id}")
async def  delete_past_paper(
    paper_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Delete a past paper (admin only)."""
    success = PastPaperService.delete_past_paper(db, paper_id)
    if not success:
        raise HTTPException(status_code=404, detail="Past paper not found")
    return await {"message": "Past paper deleted successfully"}



# ============================================================================
# QUESTION STATISTICS - Get stats about questions
# ============================================================================

@router.get("/{paper_id}/statistics")
async def  get_paper_statistics(
    paper_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """
    Get statistics about questions in a past paper.
    
    Response:
    {
        "paper_id": 1,
        "total_questions": 30,
        "total_marks": 100,
        "average_marks_per_question": 3.33,
        "questions_by_type": {
            "MCQ": 15,
            "Short": 10,
            "Long": 5
        },
        "topics": ["Thermodynamics", "Waves", "Optics"],
        "questions_with_topics": 28,
        "questions_without_topics": 2
    }
    """
    try:
        return await PastPaperService.get_paper_statistics(db, paper_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# TOPIC DISTRIBUTION - See which topics appear most
# ============================================================================

@router.get("/{subject_id}/topic-distribution")
async def  get_topic_distribution(
    subject_id: int,
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """
    Get distribution of topics for a subject.
    
    Query Parameters:
    - year: Filter by specific year (optional)
    
    Response:
    {
        "subject_id": 1,
        "total_topics": 8,
        "topics": [
            {
                "topic": "Thermodynamics",
                "count": 15,
                "percentage": 35.7,
                "total_marks": 45,
                "avg_marks_per_question": 3.0
            }
        ]
    }
    """
    try:
        return await PastPaperService.get_topic_distribution(db, subject_id, year)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# MARK DISTRIBUTION BY TOPIC - See mark allocation
# ============================================================================

@router.get("/{subject_id}/marks-by-topic")
async def  get_marks_by_topic(
    subject_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """
    Get mark distribution by topic for a subject.
    
    Response:
    {
        "subject_id": 1,
        "total_marks": 300,
        "by_topic": [
            {
                "topic": "Thermodynamics",
                "marks": 100,
                "percentage": 33.3,
                "question_count": 30
            }
        ]
    }
    """
    try:
        return await PastPaperService.get_marks_by_topic(db, subject_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
