"""taxonomy parameters

Revision ID: cc0ea82dd3d6
Revises: 6a31386c52da
Create Date: 2024-05-08 11:02:06.717971

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "cc0ea82dd3d6"
down_revision: Union[str, None] = "6a31386c52da"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "parameters",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("short_description", sa.String(), nullable=True),
        sa.Column("min", sa.Integer(), nullable=True),
        sa.Column("max", sa.Integer(), nullable=True),
        sa.Column("step", sa.Integer(), nullable=True),
        sa.Column("default", sa.Integer(), nullable=True),
        sa.Column("taxonomy_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["taxonomy_id"],
            ["taxonomies.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_parameters_name"), "parameters", ["name"], unique=True)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_parameters_name"), table_name="parameters")
    op.drop_table("parameters")
    # ### end Alembic commands ###