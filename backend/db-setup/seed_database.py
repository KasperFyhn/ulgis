import json
import os

from app.db.base import SessionLocal
from app.db.models import TaxonomyOrm, ParameterOrm


def default_param(name: str) -> ParameterOrm:
    return ParameterOrm(
        name=name,
        # default=3,
    )


def seed_database():
    session = SessionLocal()

    if session.query(TaxonomyOrm).count() != 0:
        if (
            input(
                "Taxonomy table is already populated. Type 'yes' to delete rows and reseed: "
            )
            != "yes"
        ):
            print("Aborting")
            return

    session.query(TaxonomyOrm).delete()
    session.query(ParameterOrm).delete()

    parent_dir = os.path.dirname(__file__)
    seed_data_file = os.path.join(parent_dir, "seed_data.json")

    with open(seed_data_file) as in_file:
        seed_data = json.load(in_file)
        for name, taxonomy in seed_data.items():
            try:
                session.add(
                    TaxonomyOrm(
                        name=name,
                        short_description=taxonomy["short_description"],
                        text=taxonomy["text"],
                        ui_level=taxonomy["ui_level"],
                        group=[
                            default_param(param) for param in taxonomy["parameters"]
                        ],
                    )
                )
            except Exception as e:
                print(f"Problem with {name}:", e)
    session.commit()
    print("Done!")


if __name__ == "__main__":
    seed_database()
