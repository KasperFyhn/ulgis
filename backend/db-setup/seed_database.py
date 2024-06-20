import json
import os
import sys

from app.db.base import SessionLocal
from app.db.models import TaxonomyOrm, ParameterOrm, TextContent


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
        or session.query(TextContent).count() != 0
    ):
        if (
            input(
                "Some tables are already populated. Type 'yes' to delete tables and reseed: "
            )
            != "yes"
        ):
            print("Aborting")
            return

        session.query(TaxonomyOrm).delete()
        session.query(ParameterOrm).delete()
        session.query(TextContent).delete()

    print('Seeding database ...')

    parent_dir = os.path.dirname(__file__)
    seed_data_file = os.path.join(parent_dir, "seed_data.json")

    with open(seed_data_file) as in_file:
        seed_data = json.load(in_file)
        for name, taxonomy in seed_data["taxonomies"].items():
            try:
                session.add(
                    TaxonomyOrm(
                        name=name,
                        short_description=taxonomy["short_description"],
                        text=taxonomy["text"],
                        ui_level=taxonomy["ui_level"],
                        priority=taxonomy["priority"],
                        group=[
                            default_param(param) for param in taxonomy["parameters"]
                        ],
                    )
                )
            except Exception as e:
                print(f"Problem with {name}:", e)

        for name, text in seed_data["textContent"].items():
            try:
                session.add(
                    TextContent(
                        name=name,
                        text=text,
                    )
                )
            except Exception as e:
                print(f"Problem with {name}:", e)

    session.commit()
    print("Done!")


if __name__ == "__main__":
    seed_database()
