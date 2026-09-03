"""merge_heads

Revision ID: fc8ed9437239
Revises: 8f2a4db71f40, supabase_auth_001
Create Date: 2026-09-01 17:09:14.374114

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fc8ed9437239'
down_revision: Union[str, Sequence[str], None] = ('8f2a4db71f40', 'supabase_auth_001')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
