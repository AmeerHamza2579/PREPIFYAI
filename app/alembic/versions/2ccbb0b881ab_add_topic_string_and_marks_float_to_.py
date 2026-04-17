"""add topic (string) and marks (float) to past_paper_questions

Revision ID: 2ccbb0b881ab
Revises: 20feed79a954
Create Date: 2025-10-30 17:21:05.791383

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '2ccbb0b881ab'
down_revision: Union[str, None] = '20feed79a954'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    cols = {c["name"] for c in inspector.get_columns("past_papers_questions")}
    if "topic" not in cols:
        op.add_column("past_papers_questions", sa.Column("topic", sa.String(length=255), nullable=True))
    if "marks" not in cols:
        op.add_column("past_papers_questions", sa.Column("marks", sa.Float(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    cols = {c["name"] for c in inspector.get_columns("past_papers_questions")}
    if "marks" in cols:
        op.drop_column("past_papers_questions", "marks")
    if "topic" in cols:
        op.drop_column("past_papers_questions", "topic")