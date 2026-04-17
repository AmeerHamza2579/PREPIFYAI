"""
Alembic migration script for predictions table enhancement.

Adds columns to track prediction model performance and fine-tuning metadata.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# Metadata for tracking
revision = 'prediction_model_tracking'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    cols = {c["name"] for c in inspector.get_columns("predictions")}

    # Add prediction tracking columns if they don't exist
    if "user_id" not in cols:
        op.add_column(
            "predictions",
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.user_id"), nullable=True),
        )
    
    if "question_id" not in cols:
        op.add_column(
            "predictions",
            sa.Column("question_id", sa.Integer(), sa.ForeignKey("past_papers_questions.question_id"), nullable=True),
        )
    
    if "class_level" not in cols:
        op.add_column("predictions", sa.Column("class_level", sa.String(10), nullable=True))
    
    if "question_text" not in cols:
        op.add_column("predictions", sa.Column("question_text", sa.Text(), nullable=True))
    
    if "actual_topic" not in cols:
        op.add_column("predictions", sa.Column("actual_topic", sa.String(255), nullable=True))
    
    if "predicted_topics" not in cols:
        op.add_column("predictions", sa.Column("predicted_topics", postgresql.JSON(), nullable=True))
    
    if "top_prediction" not in cols:
        op.add_column("predictions", sa.Column("top_prediction", sa.String(255), nullable=True))
    
    if "top_confidence" not in cols:
        op.add_column("predictions", sa.Column("top_confidence", sa.Float(), nullable=True))
    
    if "is_correct" not in cols:
        op.add_column("predictions", sa.Column("is_correct", sa.Integer(), nullable=True))
    
    if "all_correct" not in cols:
        op.add_column("predictions", sa.Column("all_correct", sa.Integer(), nullable=True))
    
    if "model_version" not in cols:
        op.add_column("predictions", sa.Column("model_version", sa.String(50), nullable=True))
    
    if "created_at" not in cols:
        op.add_column(
            "predictions",
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        )


def downgrade() -> None:
    # Remove added columns
    op.drop_column('predictions', 'created_at')
    op.drop_column('predictions', 'model_version')
    op.drop_column('predictions', 'all_correct')
    op.drop_column('predictions', 'is_correct')
    op.drop_column('predictions', 'top_confidence')
    op.drop_column('predictions', 'top_prediction')
    op.drop_column('predictions', 'predicted_topics')
    op.drop_column('predictions', 'actual_topic')
    op.drop_column('predictions', 'question_text')
    op.drop_column('predictions', 'class_level')
    op.drop_column('predictions', 'question_id')
    op.drop_column('predictions', 'user_id')
