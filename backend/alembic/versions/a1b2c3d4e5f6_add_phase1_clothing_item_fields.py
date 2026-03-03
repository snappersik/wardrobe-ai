"""add phase1 clothing item fields

Revision ID: a1b2c3d4e5f6
Revises: 71917474782d
Create Date: 2026-02-13 08:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = ('71917474782d', '9d33a22fefed')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Новое поле: отображаемое название вещи
    op.add_column('clothing_items', sa.Column('name', sa.String(), nullable=True))
    
    # Температурный диапазон
    op.add_column('clothing_items', sa.Column('temp_min', sa.Integer(), nullable=True))
    op.add_column('clothing_items', sa.Column('temp_max', sa.Integer(), nullable=True))
    
    # Влагозащита (0-4)
    op.add_column('clothing_items', sa.Column('waterproof_level', sa.Integer(), server_default='0'))
    
    # Мультиколор
    op.add_column('clothing_items', sa.Column('is_multicolor', sa.Boolean(), server_default='false'))
    
    # Палитра hex-кодов (JSON)
    op.add_column('clothing_items', sa.Column('color_palette', sa.String(), nullable=True))
    
    # Избранное
    op.add_column('clothing_items', sa.Column('is_favorite', sa.Boolean(), server_default='false'))


def downgrade() -> None:
    op.drop_column('clothing_items', 'is_favorite')
    op.drop_column('clothing_items', 'color_palette')
    op.drop_column('clothing_items', 'is_multicolor')
    op.drop_column('clothing_items', 'waterproof_level')
    op.drop_column('clothing_items', 'temp_max')
    op.drop_column('clothing_items', 'temp_min')
    op.drop_column('clothing_items', 'name')
