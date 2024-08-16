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
        description="By toggling this, no background taxonomy is considered.",
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
        title="Level",
        description=None,
        json_schema_extra=dict(options=["Bachelor", "Master", "PhD"]),
    )
    target_type: None = None  # for correct ordering further down
    target_name: str = Field(
        title="Name",
        description=None,
        json_schema_extra=dict(short=True),
    )
    context_description: str = Field(
        title="Context Description",
        description="Extra information about the context or setting "
        "which is relevant to the generated learning goals.",
    )


class ModularEducationInfo(EducationInfo):
    target_type: str = Field(
        title="Target",
        description="The target type of the learning goals, either a full programme, "
        "a course or a single lecture.",
        json_schema_extra=dict(options=["Programme", "Course", "Lecture"]),
    )
    previous_learning_goals: str = Field(
        title="Previous Learning Goals",
        description="Add previous learning learning goals from study regulations or "
        "similar that the LLM will draw inspiration from.",
    )


class AdvancedEducationInfo(ModularEducationInfo):
    education_level: str = Field(
        "6",
        title="EQF Education Level",
        description="Education level in EQF standards.",
        json_schema_extra=dict(options=["1", "2", "3", "4", "5", "6", "7", "8"]),
    )


class BasicLlmSettings(OptionGroup):
    creativity: float = Field(
        title="Creativity",
        description="The creativity level in generated text. 0 gives a highly "
        "predictable outcome, and 1 can lead to crazy output",
        default=0.5,
        ge=0,
        le=1.0,
        json_schema_extra=dict(step=0.01),
    )


class LlmSettings(OptionGroup):
    model: str = Field(
        default="gpt-4o",
        title="Model",
        description="Name of the underlying model that generates the learning outcomes.",
        json_schema_extra=dict(options=["gpt-3.5-turbo", "gpt-4o", "gpt-4o-mini"]),
    )
    temperature: float = Field(
        title="Temperature", default=0.7, ge=0.1, le=2, json_schema_extra=dict(step=0.1)
    )
    frequency_penalty: float = Field(
        title="Frequency penalty",
        default=0.2,
        ge=0,
        le=1,
        json_schema_extra=dict(step=0.1),
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
    education_info: EducationInfo = Field(title="Education Information")
    output_options: OutputOptions = Field(title="Output Options")


class ModularGenerationOptions(StandardGenerationOptions):
    taxonomies: ModularTaxonomyArray = Field(title="Taxonomies")
    education_info: ModularEducationInfo = Field(title="Education Info")
    # llm_settings: BasicLlmSettings = Field(
    #     title="Text Generation"
    # )


class AmpleGenerationOptions(ModularGenerationOptions):
    taxonomies: CombinableTaxonomyArray = Field(title="Taxonomies")
    education_info: AdvancedEducationInfo = Field(title="Education Info")
    custom_inputs: CustomInputs = Field(title="Custom Inputs")
    output_options: AdvancedOutputOptions = Field(title="Output Options")
    llm_settings: LlmSettings = Field(title="Model Settings")


GenerationOptions = (
    AmpleGenerationOptions | ModularGenerationOptions | StandardGenerationOptions
)
