"""add subscription_plan and price fields

Revision ID: c3d4e5f6g7h8
Revises: b2c3d4e5f6g7
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'c3d4e5f6g7h8'
down_revision = 'b2c3d4e5f6g7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Тарифный план пользователя (free/basic/premium)
    op.add_column('users', sa.Column('subscription_plan', sa.String(), server_default='free'))

    # Стоимость вещи (опционально)
    op.add_column('clothing_items', sa.Column('price', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('clothing_items', 'price')
    op.drop_column('users', 'subscription_plan')
