"""taxonomy parameters without customizable min and max

Revision ID: 47f58d1fe494
Revises: cc0ea82dd3d6
Create Date: 2024-05-14 11:16:46.404261

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "47f58d1fe494"
down_revision: Union[str, None] = "cc0ea82dd3d6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("parameters", "step")
    op.drop_column("parameters", "min")
    op.drop_column("parameters", "max")
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("parameters", sa.Column("max", sa.INTEGER(), nullable=True))
    op.add_column("parameters", sa.Column("min", sa.INTEGER(), nullable=True))
    op.add_column("parameters", sa.Column("step", sa.INTEGER(), nullable=True))
    # ### end Alembic commands ###
