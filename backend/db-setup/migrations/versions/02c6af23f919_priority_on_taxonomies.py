"""Priority on taxonomies

Revision ID: 02c6af23f919
Revises: 14ff8c47a820
Create Date: 2024-06-04 11:44:38.208154

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "02c6af23f919"
down_revision: Union[str, None] = "14ff8c47a820"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("parameters", "default")
    op.add_column("taxonomies", sa.Column("priority", sa.Float(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("taxonomies", "priority")
    op.add_column("parameters", sa.Column("default", sa.INTEGER(), nullable=True))
    # ### end Alembic commands ###
