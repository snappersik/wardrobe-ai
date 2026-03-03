"""Add Phase 2 ML training job fields

Revision ID: b2c3d4e5f6g7
Revises: a1b2c3d4e5f6
Create Date: 2026-02-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6g7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('ml_training_jobs', sa.Column('model_type', sa.String(), server_default='resnet50'))
    op.add_column('ml_training_jobs', sa.Column('epochs', sa.Integer(), server_default='15'))
    op.add_column('ml_training_jobs', sa.Column('batch_size', sa.Integer(), server_default='32'))
    op.add_column('ml_training_jobs', sa.Column('progress', sa.Float(), server_default='0.0'))
    op.add_column('ml_training_jobs', sa.Column('current_epoch', sa.Integer(), server_default='0'))
    op.add_column('ml_training_jobs', sa.Column('error_message', sa.Text(), nullable=True))
    op.add_column('ml_training_jobs', sa.Column('dataset_info', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('ml_training_jobs', 'dataset_info')
    op.drop_column('ml_training_jobs', 'error_message')
    op.drop_column('ml_training_jobs', 'current_epoch')
    op.drop_column('ml_training_jobs', 'progress')
    op.drop_column('ml_training_jobs', 'batch_size')
    op.drop_column('ml_training_jobs', 'epochs')
    op.drop_column('ml_training_jobs', 'model_type')
