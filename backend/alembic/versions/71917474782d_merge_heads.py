"""merge_heads

Revision ID: 71917474782d
Revises: b993150de577, e4c4e2b9c9b0
Create Date: 2026-02-05 09:11:02.091130

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '71917474782d'
down_revision: Union[str, None] = ('b993150de577', 'e4c4e2b9c9b0')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
