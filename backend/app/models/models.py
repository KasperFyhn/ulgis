from typing import Iterable

from fastapi_camelcase import CamelModel
from pydantic import Field, Extra

from app.db.models import TaxonomyOrm

OptionType = bool | str | float | int | list[str]


class OptionGroup(CamelModel):
    """An Abstract class. Child classes should contain fields of type OptionType."""

    pass


class ToggledOptionGroup(CamelModel):
    """An Abstract class. Child classes should contain fields of type OptionType."""

    enabled: bool = False


class ToggledOptionGroupArray(CamelModel):
    """An Abstract class. Child classes should contain fields of type ToggledOptionGroup."""

    multiple: bool = True
    pass


class Taxonomy(ToggledOptionGroup):
    class Config:
        extra = Extra.allow

    def iter_options(self) -> Iterable[tuple[str, OptionType]]:
        return ((name, d) for name, d in self.model_extra.items())


class TaxonomyArray(ToggledOptionGroupArray):
    class Config:
        extra = Extra.allow
        depends = TaxonomyOrm

    def is_any_enabled(self) -> bool:
        return any(taxonomy.enabled for _, taxonomy in self.iter_taxonomies())

    def iter_taxonomies(self) -> Iterable[tuple[str, Taxonomy]]:
        return (
            (name, Taxonomy.model_validate(d)) for name, d in self.model_extra.items()
        )


class EducationInfo(OptionGroup):
    education_level: str = Field(
        "Bachelor",
        title="Education Level",
        description="Education level",
        json_schema_extra=dict(
            options=["Bachelor", "Master", "PhD"], ui_level="simple"
        ),
    )
    education_name: str = Field(
        title="Education Name",
        description="Education name",
        json_schema_extra=dict(short=True, ui_level="simple"),
    )
    education_description: str = Field(
        title="Education Description",
        description="Education Description",
        json_schema_extra=dict(ui_level="standard"),
    )
    previous_learning_goals: str = Field(
        title="Previous Learning Goals",
        description="Previous Learning Goals",
        json_schema_extra=dict(ui_level="advanced"),
    )


class CustomInputs(OptionGroup):
    custom_instruction: str = Field(
        title="Custom Instruction",
        description="Custom instructions for the LLM, for example: a specific context, language, situation, etc.",
        json_schema_extra=dict(ui_level="advanced"),
    )
    extra_inputs: list[str] = Field(
        title="Extra Inputs",
        description="Extra inputs akin to taxonomies that the LLM should take into account, for example: previous "
        "learning outcomes from study regulations, programme or course descriptions, etc.",
        json_schema_extra=dict(ui_level="advanced"),
    )


class LearningGoals(ToggledOptionGroup):
    enabled: bool = True


class CompetencyProfile(ToggledOptionGroup):
    pass


class BulletPointOptions(ToggledOptionGroup):
    number_of_bullets: int = Field(
        10,
        title="Number of Bullets",
        description="The number of bullets that the LLM is instructed to write out.",
        ge=1,
        le=25,
        json_schema_extra=dict(step=1, ui_level="advanced"),
    )
    nested: bool = Field(
        title="Nested",
        description="Whether the LLM is instructed to write out nested bullet points.",
    )


class ProseDescriptionOptions(ToggledOptionGroup):
    number_of_words: int = Field(
        250,
        title="Number of Words",
        description="The number of words that the LLM is instructed to write out.",
        ge=10,
        le=500,
        json_schema_extra=dict(step=1),
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
        description="Instruct the LLM to write out learning goals.",
    )
    competency_profile: CompetencyProfile = Field(
        title="Competency Profile",
        description="Instruct the LLM to write out a competency profile.",
    )
    bullet_points: BulletPointOptions = Field(
        title="Bullet Points",
        description="Instruct the LLM to write in bullet points.",
        json_schema_extra=dict(ui_level="advanced"),
    )
    prose_description: ProseDescriptionOptions = Field(
        title="Prose Description",
        description="Instruct the LLM to write a prose description.",
        json_schema_extra=dict(ui_level="advanced"),
    )


class GenerationOptions(CamelModel):
    taxonomies: TaxonomyArray = Field(title="Taxonomies", description="Taxonomies")
    education_info: EducationInfo = Field(
        title="Education Information",
        description="Education Information",
        json_schema_extra=dict(ui_level="simple"),
    )
    custom_inputs: CustomInputs = Field(
        title="Custom Inputs",
        description="Custom inputs",
    )
    output_options: OutputOptions = Field(
        title="Output Options",
        description="Options for instructing an LLM about output format.",
    )
