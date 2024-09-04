from pydantic import Field

from app.models._base import ToggledOptionGroup, ToggledOptionGroupArray


class LearningGoals(ToggledOptionGroup):
    enabled: bool = True


class CompetencyProfile(ToggledOptionGroup):
    pass


class BulletPointOptions(ToggledOptionGroup):
    number_of_bullets: int = Field(
        10,
        title="Number of Bullets",
        description="The number of bullets that the LLM is instructed to write out.",
        ge=5,
        le=25,
    )
    nested: bool = Field(
        default=True,
        title="Nested",
        description="Whether the LLM is instructed to write out nested bullet points.",
    )


class ProseDescriptionOptions(ToggledOptionGroup):
    number_of_words: int = Field(
        250,
        title="Number of Words",
        description="The number of words that the LLM is instructed to write out.",
        ge=50,
        le=500,
    )
    headings: bool = Field(
        True,
        title="Headings",
        description="Whether the LLM is instructed to write out headings.",
    )


class OutputOptions(ToggledOptionGroupArray):
    multiple: bool = False
    learning_goals: LearningGoals = Field(
        title="Learning Goals",
        description="Instruct the LLM to write out a list of learning goals.",
    )
    competency_profile: CompetencyProfile = Field(
        title="Competency Profile",
        description="Instruct the LLM to write out a competency profile.",
    )


class AdvancedOutputOptions(OutputOptions):
    bullet_points: BulletPointOptions = Field(
        title="Bullet Points",
        description="Instruct the LLM to write in bullet points.",
    )
    prose_description: ProseDescriptionOptions = Field(
        title="Prose Description",
        description="Instruct the LLM to write a prose description.",
    )
