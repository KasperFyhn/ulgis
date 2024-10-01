import json
import os
import sys

from app.db.backup import overwrite_tables
from app.db.base import SessionLocal
from app.db.models import TaxonomyOrm, ParameterOrm, TextContentOrm


def default_param(name: str) -> ParameterOrm:
    return ParameterOrm(
        name=name,
        # default=3,
    )


def seed_database():
    try:
        session = SessionLocal()
    except Exception as e:
        print(f"Exception while initializing database: {e}")
        print(
            "Maybe you need to create a .env file with a DATABASE_URL environment variable?"
        )
        sys.exit(1)

    if (
        session.query(TaxonomyOrm).count() != 0
        or session.query(ParameterOrm).count() != 0
        or session.query(TextContentOrm).count() != 0
    ):
        if (
            input(
                "Some tables are already populated. Type 'yes' to delete tables and reseed: "
            )
            != "yes"
        ):
            print("Aborting")
            return

    print("Seeding database ...")

    parent_dir = os.path.dirname(__file__)
    seed_data_file = os.path.join(parent_dir, "seed_data.json")
    with open(seed_data_file, "r") as f:
        data = json.load(f)

    overwrite_tables(data, session)

    print("Database seeding complete")


if __name__ == "__main__":
    seed_database()
