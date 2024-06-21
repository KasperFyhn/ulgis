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
    priority: float = 0.0


class ToggledOptionGroupArray(CamelModel):
    """An Abstract class. Child classes should contain fields of type ToggledOptionGroup."""

    multiple: bool = True
    pass


class Taxonomy(ToggledOptionGroup):
    class Config:
        extra = Extra.allow

    def iter_options(self) -> Iterable[tuple[str, OptionType]]:
        return ((name, d) for name, d in self.model_extra.items())


class NoneTaxonomy(Taxonomy):
    priority: float = -1000


class StandardTaxonomyArray(ToggledOptionGroupArray):
    class Config:
        extra = Extra.allow
        depends = TaxonomyOrm
        ui_level = "Standard"

    multiple: bool = False

    none: NoneTaxonomy = Field(
        title="No Taxonomy",
    )

    def is_any_enabled(self) -> bool:
        # the "none" taxonomy is not checked since it will not be part of iter_taxonomies()
        return any(taxonomy.enabled for _, taxonomy in self.iter_taxonomies())

    def iter_taxonomies(self) -> Iterable[tuple[str, Taxonomy]]:
        return (
            (name, Taxonomy.model_validate(d)) for name, d in self.model_extra.items()
        )


class ModularTaxonomyArray(StandardTaxonomyArray):
    class Config:
        ui_level = "Modular"


class CombinableTaxonomyArray(ModularTaxonomyArray):
    class Config:
        ui_level = "Ample"

    none: None = None
    multiple: bool = True


class EducationInfo(OptionGroup):
    education_level: str = Field(
        "Bachelor",
        title="Education Level",
        description="Education level",
        json_schema_extra=dict(options=["Bachelor", "Master", "PhD"]),
    )
    education_name: str = Field(
        title="Education Name",
        description="Education name",
        json_schema_extra=dict(short=True),
    )
    education_description: str = Field(
        title="Education Description",
        description="Education Description",
    )


class ModularEducationInfo(EducationInfo):
    previous_learning_goals: str = Field(
        title="Previous Learning Goals",
        description="Previous Learning Goals",
    )


class AdvancedEducationInfo(ModularEducationInfo):
    education_level: str = Field(
        "6",
        title="EQF Education Level",
        description="Education level",
        json_schema_extra=dict(options=["1", "2", "3", "4", "5", "6", "7", "8"]),
    )


class LlmSettings(OptionGroup):
    model: str = Field(
        default="gpt-4o",
        title="Model",
        description="Model name",
        json_schema_extra=dict(options=["gpt-3.5-turbo", "gpt-4o"]),
    )
    temperature: float = Field(
        title="Temperature", default=1, ge=0, le=2, json_schema_extra=dict(step=0.01)
    )


class CustomInputs(OptionGroup):
    custom_instruction: str = Field(
        title="Custom Instruction",
        description="Custom instructions for the LLM, for example: a specific context, language, situation, etc.",
    )
    extra_inputs: list[str] = Field(
        title="Extra Inputs",
        description="Extra inputs akin to taxonomies that the LLM should take into account, for example: previous "
        "learning outcomes from study regulations, programme or course descriptions, etc.",
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
        description="Instruct the LLM to write out learning goals.",
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


class _GenerationOptionsBase(CamelModel):
    taxonomies: None = None
    education_info: None = None
    llm_settings: None = None
    output_options: None = None
    custom_inputs: None = None


class StandardGenerationOptions(_GenerationOptionsBase):
    taxonomies: StandardTaxonomyArray = Field(
        title="Taxonomies", description="Taxonomies"
    )
    education_info: EducationInfo = Field(
        title="Education Information",
        description="Education Information",
    )
    output_options: OutputOptions = Field(
        title="Output Options",
        description="Options for instructing an LLM about output format.",
    )


class ModularGenerationOptions(StandardGenerationOptions):
    taxonomies: ModularTaxonomyArray = Field(
        title="Taxonomies", description="Taxonomies"
    )
    education_info: ModularEducationInfo = Field(
        title="Education Info", description="Education Info"
    )


class AmpleGenerationOptions(ModularGenerationOptions):
    taxonomies: CombinableTaxonomyArray = Field(
        title="Taxonomies", description="Taxonomies"
    )
    education_info: AdvancedEducationInfo = Field(
        title="Education Information",
        description="Education Information",
    )
    custom_inputs: CustomInputs = Field(
        title="Custom Inputs",
        description="Custom inputs",
    )
    output_options: AdvancedOutputOptions = Field(
        title="Output Options",
        description="Options for instructing an LLM about output format.",
    )
    llm_settings: LlmSettings = Field(
        title="Model Settings", description="Model Settings"
    )


GenerationOptions = (
    AmpleGenerationOptions | ModularGenerationOptions | StandardGenerationOptions
)
