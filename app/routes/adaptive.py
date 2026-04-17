"""
Adaptive next-question API for logged-in students.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.config import settings
from app.database import get_db
from app.models.user import User
from app.models.generated_question import GeneratedQuestion
from app.models.student_performance import StudentPerformance
from app.models.subject import Subject
from app.services.generator import generate_questions
from app.services.performance_service import PerformanceService
from app.core.security import get_current_user


router = APIRouter()


def _target_difficulty(recent_accuracy: float, current: str) -> str:
    current = current or "Medium"
    order = ["Easy", "Medium", "Hard"]
    idx = order.index(current) if current in order else 1
    if recent_accuracy >= 80.0 and idx < 2:
        return order[idx + 1]
    if recent_accuracy < 50.0 and idx > 0:
        return order[idx - 1]
    return current


@router.get("/next-question")
async def get_next_question(
    subject_id: int,
    topic_name: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Suggest the next best question for the logged-in user based on recent performance.
    """
    # Recent performances (last 50)
    q = (
        select(StudentPerformance)
        .where(
            StudentPerformance.user_id == current_user.user_id,
            StudentPerformance.subject_id == subject_id,
        )
        .order_by(StudentPerformance.attempted_on.desc())
        .limit(50)
    )
    if topic_name:
        q = q.where(StudentPerformance.topic_name == topic_name)

    result = await db.execute(q)
    recents = result.scalars().all()

    if recents:
        correct = sum(1 for p in recents if p.is_correct)
        recent_accuracy = (correct / len(recents)) * 100
        last_question = recents[0].question
        last_diff = last_question.difficulty_level if last_question else "Medium"
        target_diff = _target_difficulty(recent_accuracy, last_diff)
    else:
        recent_accuracy = 0.0
        target_diff = "Easy"

    # Try to find an existing approved question at this difficulty
    q2 = select(GeneratedQuestion).where(
        GeneratedQuestion.subject_id == subject_id,
        GeneratedQuestion.difficulty_level == target_diff,
        or_(
            GeneratedQuestion.is_approved == "approved",
            GeneratedQuestion.is_approved.is_(None),
        ),
    )
    result2 = await db.execute(q2.limit(1))
    question = result2.scalar_one_or_none()

    if not question:
        # Fallback: generate one new question on the fly
        subj_res = await db.execute(select(Subject).where(Subject.subject_id == subject_id))
        subject = subj_res.scalar_one_or_none()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")

        exam = f"{subject.board} Class {subject.class_level}"
        raw = generate_questions(
            topic=topic_name or "any",
            subject=subject.subject_name,
            exam=exam,
            difficulty=target_diff,
            qtype="short",
            num_questions=1,
        )[0]

        _ap = (
            "pending"
            if getattr(settings, "REQUIRE_GENERATED_QUESTION_APPROVAL", False)
            else "approved"
        )
        question = GeneratedQuestion(
            subject_id=subject.subject_id,
            question_text=raw.get("question", ""),
            question_type="Short",
            difficulty_level=target_diff,
            options=None,
            correct_answer=raw.get("answer", ""),
            explanation=None,
            marks=int(raw.get("marks", 0) or 0) or None,
            is_approved=_ap,
        )
        db.add(question)
        await db.flush()
        await db.commit()

    return {
        "question_id": question.question_id,
        "question_text": question.question_text,
        "question_type": question.question_type,
        "difficulty_level": question.difficulty_level,
        "marks": question.marks or 0,
        "options": question.options,
        "correct_answer": question.correct_answer or "",
        "source": "generated" if not recents else "existing",
    }


@router.get("/revision-plan")
async def get_revision_plan(
    subject_id: int,
    horizon_days: int = Query(7, ge=1, le=30),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Build a simple multi-day revision outline from weak/strong topics and recent trend.
    """
    svc = PerformanceService(db)
    analytics = await svc.get_user_analytics(current_user.user_id, subject_id)
    weak = list(analytics.weak_topics or [])
    strong = list(analytics.strong_topics or [])
    days = max(1, min(horizon_days, 30))

    daily_focus = []
    for i, topic in enumerate(weak[:10]):
        daily_focus.append(
            {
                "day_index": i % days,
                "topic": topic,
                "priority": "high" if i < 4 else "medium",
                "suggested_practice_questions": 6 if i < 3 else 4,
                "rationale": "Below 60% accuracy in recent attempts",
            }
        )

    maintenance = [
        {"topic": t, "suggested_practice_questions": 2, "priority": "low"}
        for t in strong[:6]
    ]

    strategies = []
    if analytics.accuracy_percentage is not None and analytics.accuracy_percentage < 55:
        strategies.append("Increase easy/medium drills before hard questions.")
    if analytics.recent_trend == "declining":
        strategies.append("Shorter sessions with more frequent review may help retention.")
    if not weak:
        strategies.append("Maintain streak with mixed-topic mixed-difficulty practice.")

    return {
        "subject_id": subject_id,
        "horizon_days": days,
        "accuracy_percentage": analytics.accuracy_percentage,
        "recent_trend": analytics.recent_trend,
        "weak_topics": weak,
        "strong_topics": strong,
        "daily_focus": daily_focus,
        "maintenance_topics": maintenance,
        "strategies": strategies,
    }

