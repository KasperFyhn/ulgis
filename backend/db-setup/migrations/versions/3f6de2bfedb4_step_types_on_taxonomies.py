"""Step types on taxonomies

Revision ID: 3f6de2bfedb4
Revises: b0a667f15e4f
Create Date: 2024-09-30 12:05:29.680956

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3f6de2bfedb4"
down_revision: Union[str, None] = "b0a667f15e4f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "taxonomies",
        sa.Column(
            "step_type", sa.Enum("LEVEL", "ATTENTION", name="steptype"), nullable=True
        ),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("taxonomies", "step_type")
    # ### end Alembic commands ###
