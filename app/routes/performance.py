"""
Performance & analytics for logged-in students.
"""

from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.student_performance import StudentPerformance
from app.schemas.student_performance import PerformanceAnalytics
from app.services.performance_service import PerformanceService
from app.core.security import get_current_user


router = APIRouter()


@router.get("/summary", response_model=PerformanceAnalytics)
async def get_performance_summary(
    subject_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Overall performance summary for the logged-in user.
    Optionally filter by subject_id.
    """
    service = PerformanceService(db)
    return await service.get_user_analytics(
        user_id=current_user.user_id,
        subject_id=subject_id,
    )


@router.get("/by-topic")
async def get_performance_by_topic(
    subject_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Topic-wise performance for a subject for the logged-in user.
    """
    result = await db.execute(
        select(StudentPerformance).where(
            StudentPerformance.user_id == current_user.user_id,
            StudentPerformance.subject_id == subject_id,
        )
    )
    performances: List[StudentPerformance] = result.scalars().all()

    topics: Dict[str, Dict[str, Any]] = {}
    for p in performances:
        t = (p.topic_name or "Unknown").strip() or "Unknown"
        if t not in topics:
            topics[t] = {
                "topic_name": t,
                "attempts": 0,
                "correct": 0,
                "total_score": 0.0,
                "total_time": 0,
            }
        topics[t]["attempts"] += 1
        if p.is_correct:
            topics[t]["correct"] += 1
        if p.score_percentage is not None:
            topics[t]["total_score"] += float(p.score_percentage)
        if p.time_taken:
            topics[t]["total_time"] += p.time_taken

    out = []
    for t, agg in topics.items():
        attempts = agg["attempts"]
        correct = agg["correct"]
        avg_score = (agg["total_score"] / attempts) if attempts else 0.0
        avg_time = (agg["total_time"] / attempts) if attempts else 0
        accuracy = (correct / attempts) * 100 if attempts else 0.0
        out.append(
            {
                "topic_name": t,
                "attempts": attempts,
                "correct": correct,
                "accuracy": round(accuracy, 1),
                "avg_score": round(avg_score, 1),
                "avg_time": avg_time,
            }
        )

    return {"topics": out}

