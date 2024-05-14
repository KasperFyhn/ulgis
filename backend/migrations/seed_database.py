import json
import os

from app.db.base import SessionLocal
from app.db.models import Taxonomy, Parameter


def default_param(name: str) -> Parameter:
    return Parameter(
        name=name,
        default=3,
    )


def seed_database():
    session = SessionLocal()

    if session.query(Taxonomy).count() != 0:
        if input("Taxonomy table already exists. Continue? [y/N]: ") != "y":
            return
    parent_dir = os.path.dirname(__file__)
    seed_data_file = os.path.join(parent_dir, "seed_data.json")
    with open(seed_data_file) as in_file:
        seed_data = json.load(in_file)
        for name, taxonomy in seed_data.items():
            try:
                session.add(
                    Taxonomy(
                        name=name,
                        short_description=taxonomy["short_description"],
                        text=taxonomy["text"],
                        parameters=[
                            default_param(param) for param in taxonomy["parameters"]
                        ],
                    )
                )
            except Exception as e:
                print(f"Problem with {name}:", e)
    session.commit()


if __name__ == "__main__":
    seed_database()
