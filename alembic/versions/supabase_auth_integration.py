"""Add Supabase authentication fields to User model

Revision ID: supabase_auth_001
Revises: 403ea243d1a9
Create Date: 2026-08-31 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'supabase_auth_001'
down_revision: Union[str, Sequence[str], None] = '403ea243d1a9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns for external auth provider support
    op.add_column('users', sa.Column('external_auth_provider', sa.String(), nullable=True))
    op.add_column('users', sa.Column('external_subject', sa.String(), nullable=True))
    op.add_column('users', sa.Column('display_name', sa.String(), nullable=True))
    op.add_column('users', sa.Column('updated_at', sa.DateTime(), nullable=True))
    
    # Make email nullable for OAuth flows
    op.alter_column('users', 'email', existing_type=sa.String(), nullable=True)
    
    # Create indexes for external auth lookups
    op.create_index('ix_external_auth_provider', 'users', ['external_auth_provider'])
    op.create_index('ix_external_subject', 'users', ['external_subject'])
    op.create_index('ix_external_auth', 'users', ['external_auth_provider', 'external_subject'], unique=True)


def downgrade() -> None:
    # Remove indexes
    op.drop_index('ix_external_auth', table_name='users')
    op.drop_index('ix_external_subject', table_name='users')
    op.drop_index('ix_external_auth_provider', table_name='users')
    
    # Remove columns
    op.drop_column('users', 'updated_at')
    op.drop_column('users', 'display_name')
    op.drop_column('users', 'external_subject')
    op.drop_column('users', 'external_auth_provider')
    
    # Revert email to non-nullable
    op.alter_column('users', 'email', existing_type=sa.String(), nullable=False)
