from app.db.base import SessionLocal
from app.db.models import Taxonomy, Parameter


def default_param(name: str) -> Parameter:

    return Parameter(
        name=name,
        min=0,
        max=5,
        step=1,
        default=3,
    )


def seed_database():
    session = SessionLocal()

    if session.query(Taxonomy).count() == 0:
        bloom = Taxonomy(
            name="Bloom's Taxonomy of Educational Objectives (1956)",
            short_description="Bloom's Taxonomy of Educational Objectives (1956)",
            text="Placeholder text",
            parameters=[
                default_param(level)
                for level in [
                    "Knowledge",
                    "Comprehension",
                    "Application",
                    "Analysis",
                    "Synthesis",
                    "Evaluation",
                ]
            ],
        )
        session.add(bloom)
        solo = Taxonomy(
            name="Solo Taxonomy (1982)",
            short_description="Solo Taxonomy (1982)",
            text="Placeholder text",
            parameters=[
                default_param(level)
                for level in [
                    "Pre-structural",
                    "Uni-structural",
                    "Multi-structural",
                    "Relational",
                    "Extended abstract",
                ]
            ],
        )
        session.add(solo)
        harrow = Taxonomy(
            name="Harrow's Taxonomy (1972)",
            short_description="Harrow's Taxonomy (1972)",
            text="Placeholder text",
            parameters=[
                default_param(movement)
                for movement in [
                    "Reflex movements",
                    "Basic fundamental movements",
                    "Perceptual abilities",
                    "Physical abilities",
                    "Skilled movements",
                    "Non-discursive communication",
                ]
            ],
        )
        session.add(harrow)
        kratwohl = Taxonomy(
            name="Kratwohl's Taxonomy of Affective Domain (1964)",
            short_description="Kratwohl's Taxonomy of Affective Domain (1964)",
            text="Placeholder text",
            parameters=[
                default_param(aspect)
                for aspect in [
                    "Receiving",
                    "Responding",
                    "Valuing",
                    "Organization",
                    "Characterization by value",
                ]
            ],
        )
        session.add(kratwohl)
        digcomp = Taxonomy(
            name="DigComp 2.2 (2022)",
            short_description="DigComp 2.2 (2022)",
            text="Placeholder text",
            parameters=[
                default_param(competency)
                for competency in [
                    "Information and data literacy",
                    "Communication and collaboration",
                    "Digital content creation",
                    "Safety",
                    "Problem solving",
                ]
            ],
        )
        session.add(digcomp)

        session.commit()


if __name__ == "__main__":
    seed_database()
