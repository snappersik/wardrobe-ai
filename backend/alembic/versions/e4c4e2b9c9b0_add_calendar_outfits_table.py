"""add calendar_outfits table

Revision ID: e4c4e2b9c9b0
Revises: d3910859ff51
Create Date: 2026-02-05 01:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e4c4e2b9c9b0'
down_revision: Union[str, None] = 'd3910859ff51'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'calendar_outfits',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('outfit_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['outfit_id'], ['outfits.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'outfit_id', 'date', name='uq_calendar_user_outfit_date')
    )
    op.create_index(op.f('ix_calendar_outfits_user_id'), 'calendar_outfits', ['user_id'], unique=False)
    op.create_index(op.f('ix_calendar_outfits_outfit_id'), 'calendar_outfits', ['outfit_id'], unique=False)
    op.create_index(op.f('ix_calendar_outfits_date'), 'calendar_outfits', ['date'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_calendar_outfits_date'), table_name='calendar_outfits')
    op.drop_index(op.f('ix_calendar_outfits_outfit_id'), table_name='calendar_outfits')
    op.drop_index(op.f('ix_calendar_outfits_user_id'), table_name='calendar_outfits')
    op.drop_table('calendar_outfits')
