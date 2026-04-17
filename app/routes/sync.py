"""
Offline sync endpoints for mobile clients.
"""

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.database import get_db
from app.models.generated_question import GeneratedQuestion
from app.models.student_performance import StudentPerformance
from app.models.user import User


router = APIRouter()


@router.get("/pull")
async def pull_sync(
    since: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Pull server changes since a timestamp.
    Returns generated questions and this user's performance records.
    """
    since_dt: datetime | None = None
    if since:
        try:
            since_dt = datetime.fromisoformat(since)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid since timestamp: {e}")

    q_stmt = select(GeneratedQuestion).where(
        or_(
            GeneratedQuestion.is_approved == "approved",
            GeneratedQuestion.is_approved.is_(None),
        )
    )
    p_stmt = select(StudentPerformance).where(StudentPerformance.user_id == current_user.user_id)
    if since_dt is not None:
        q_stmt = q_stmt.where(GeneratedQuestion.created_at >= since_dt)
        p_stmt = p_stmt.where(StudentPerformance.attempted_on >= since_dt)

    q_res = await db.execute(q_stmt.limit(200))
    p_res = await db.execute(p_stmt.limit(500))

    questions = q_res.scalars().all()
    performances = p_res.scalars().all()

    return {
        "questions": [
            {
                "question_id": q.question_id,
                "subject_id": q.subject_id,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "difficulty_level": q.difficulty_level,
                "marks": q.marks,
                "updated_at": q.created_at.isoformat() if q.created_at else None,
            }
            for q in questions
        ],
        "performances": [
            {
                "performance_id": p.performance_id,
                "question_id": p.question_id,
                "user_answer": p.user_answer,
                "is_correct": p.is_correct,
                "time_taken": p.time_taken,
                "score_percentage": p.score_percentage,
                "attempted_on": p.attempted_on.isoformat() if p.attempted_on else None,
            }
            for p in performances
        ],
        "server_time": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/push")
async def push_sync(
    payload: dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Push offline attempts from device to server.
    Expects payload.attempts = [{question_id, user_answer, time_taken, score_percentage, is_correct, attempted_on?}]
    """
    attempts = payload.get("attempts", [])
    if not isinstance(attempts, list):
        raise HTTPException(status_code=400, detail="attempts must be a list")

    accepted = 0
    for item in attempts:
        if not isinstance(item, dict):
            continue
        question_id = item.get("question_id")
        if question_id is None:
            continue

        # lookup question to keep subject relation valid
        q_res = await db.execute(
            select(GeneratedQuestion).where(GeneratedQuestion.question_id == int(question_id))
        )
        question = q_res.scalar_one_or_none()
        if question is None:
            continue
        st = (question.is_approved or "approved").lower()
        if st not in ("approved",):
            continue

        p = StudentPerformance(
            user_id=current_user.user_id,
            subject_id=question.subject_id,
            question_id=question.question_id,
            user_answer=item.get("user_answer"),
            is_correct=item.get("is_correct"),
            time_taken=item.get("time_taken"),
            score_percentage=item.get("score_percentage"),
        )
        db.add(p)
        accepted += 1

    await db.commit()
    return {"accepted": accepted}

