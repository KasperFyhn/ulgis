from pydantic import Field

from app.models._base import OptionGroup


class InspirationSeeds(OptionGroup):
    keywords: list[str] = Field(
        title="Keywords",
        description="Keywords used to generate the learning outcomes.",
        json_schema_extra=(dict(short=True)),
    )
