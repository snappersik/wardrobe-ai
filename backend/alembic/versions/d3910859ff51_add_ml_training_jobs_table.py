"""add ml_training_jobs table

Revision ID: d3910859ff51
Revises: c2850748ee40
Create Date: 2026-01-31 20:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'd3910859ff51'
down_revision: Union[str, None] = 'c2850748ee40'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('ml_training_jobs',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('start_time', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('end_time', sa.TIMESTAMP(timezone=True), nullable=True),
    sa.Column('result_model_path', sa.String(), nullable=True),
    sa.Column('metrics', sa.JSON(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ml_training_jobs_status'), 'ml_training_jobs', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_ml_training_jobs_status'), table_name='ml_training_jobs')
    op.drop_table('ml_training_jobs')
