"""remove_hashed_password_column

Revision ID: fc1727965ca7
Revises: 2c1666bc306f
Create Date: 2025-11-18 09:52:46.348957

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fc1727965ca7'
down_revision: Union[str, None] = '2c1666bc306f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the hashed_password column since we're using OAuth only
    op.drop_column('users', 'hashed_password')


def downgrade() -> None:
    # Add back the hashed_password column if we need to rollback
    op.add_column('users', sa.Column('hashed_password', sa.String(), nullable=False, server_default=''))

