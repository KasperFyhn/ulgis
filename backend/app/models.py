from typing import Literal, Optional, Union, Any, Callable, Iterable

from annotated_types import Ge, Le
from fastapi_camelcase import CamelModel
from pydantic import Field, Extra, field_validator
from pydantic.fields import FieldInfo
from typing_extensions import Annotated

# DATA CLASSES
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


class Taxonomies(ToggledOptionGroupArray):
    class Config:
        extra = Extra.allow

    def is_any_enabled(self) -> bool:
        return any(taxonomy.enabled for _, taxonomy in self.iter_taxonomies())

    def iter_taxonomies(self) -> Iterable[tuple[str, Taxonomy]]:
        return (
            (name, Taxonomy.model_validate(d)) for name, d in self.model_extra.items()
        )


class Settings(OptionGroup):
    education_level: str = Field(
        title="Education Level",
        description="Education level",
        json_schema_extra=dict(
            options=["Bachelor", "Master", "PhD"],
        ),
    )
    education_name: str = Field(
        title="Education Name",
        description="Education name",
        json_schema_extra=dict(short=True),
    )


class CustomInputs(OptionGroup):
    custom_instruction: str = Field(
        title="Custom Instruction",
        description="Custom Instruction",
    )
    extra_inputs: list[str] = Field(title="Extra Inputs", description="Extra inputs")


class SixLearningGoals(ToggledOptionGroup):
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
        json_schema_extra=dict(step=1),
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
    six_learning_goals: SixLearningGoals = Field(
        title="6 Learning Goals",
        description="Instruct the LLM to write out six learning goals.",
    )
    competency_profile: CompetencyProfile = Field(
        title="Competency Profile",
        description="Instruct the LLM to write out a competency profile.",
    )
    bullet_points: BulletPointOptions = Field(
        title="Bullet Points",
        description="Instruct the LLM to write in bullet points.",
    )
    prose_description: ProseDescriptionOptions = Field(
        title="Prose Description",
        description="Instruct the LLM to write a prose description.",
    )


class GenerationOptions(CamelModel):
    taxonomies: Taxonomies = Field(
        title="Taxonomies",
        description="Taxonomies",
    )
    settings: Settings = Field(
        title="Settings",
        description="Settings",
    )
    custom_inputs: CustomInputs = Field(
        title="Custom Inputs",
        description="Custom inputs",
    )
    output_options: OutputOptions = Field(
        title="Output Options",
        description="Options for instructing an LLM about output format.",
    )


# METADATA CLASSES
class OptionMetadataBase(CamelModel):
    name: str
    description: Optional[str] = Field(
        default=None,
        title="Description",
        validation_alias="short_description",
    )


class BooleanOptionMetadata(OptionMetadataBase):
    type: Literal["boolean"] = "boolean"
    default: Optional[bool] = None


class StringOptionMetadata(OptionMetadataBase):
    type: Literal["string"] = "string"
    default: Optional[str] = None
    options: Optional[list[str]] = None
    short: Optional[bool] = None


class StringArrayOptionMetadata(OptionMetadataBase):
    type: Literal["stringArray"] = "stringArray"
    default: Optional[list[str]] = None
    options: Optional[list[str]] = None


class NumberOptionMetadata(OptionMetadataBase):
    class Config:
        from_attributes = True

    type: Literal["number"] = "number"
    default: int | float = None
    min: int | float = 0
    max: int | float = 5
    step: int | float = 1.0


OptionMetadata = Annotated[
    Union[
        BooleanOptionMetadata,
        StringOptionMetadata,
        StringArrayOptionMetadata,
        NumberOptionMetadata,
    ],
    Field(discriminator="type"),
]


class OptionGroupMetadata(OptionMetadataBase):
    group: dict[str, OptionMetadata]

    @field_validator("group", mode="before")
    def group_validator(cls, group):
        if isinstance(group, list):
            return {v.name: v for v in group}
        return group


class ToggledOptionGroupMetadata(OptionGroupMetadata):
    default: bool


class ToggledOptionGroupArrayMetadata(OptionMetadataBase):
    multiple: bool
    groups: dict[str, ToggledOptionGroupMetadata]


class TaxonomyMetadata(ToggledOptionGroupMetadata):
    class Config:
        from_attributes = True

    description: str = Field(validation_alias="short_description")
    default: bool = False
    group: dict[str, NumberOptionMetadata] = Field(validation_alias="parameters")


class TaxonomyArrayMetadata(ToggledOptionGroupArrayMetadata):
    multiple: bool = True
    groups: dict[str, TaxonomyMetadata]


def _get_from_metadata(
    metadata: list[Any], clazz: type, cast: Callable[[Any], Any] = lambda x: x
) -> Optional[Any]:
    for field in metadata:
        if isinstance(field, clazz):
            return cast(field)


def create_metadata(field: FieldInfo):
    if field.annotation == bool:
        return BooleanOptionMetadata(
            name=field.title or "No name",
            description=field.description,
            default=field.default,
        )
    elif field.annotation == float or field.annotation == int:
        return NumberOptionMetadata(
            name=field.title or "No name",
            description=field.description,
            default=field.default,
            min=_get_from_metadata(field.metadata, Ge, lambda ge: float(ge.ge)),
            max=_get_from_metadata(field.metadata, Le, lambda le: float(le.le)),
            step=(
                field.json_schema_extra.get("step") if field.json_schema_extra else None
            ),
        )
    elif field.annotation == str:
        return StringOptionMetadata(
            name=field.title or "No name",
            description=field.description,
            default=field.default,
            options=(
                field.json_schema_extra.get("options")
                if field.json_schema_extra
                else None
            ),
            short=(
                field.json_schema_extra.get("short")
                if field.json_schema_extra
                else None
            ),
        )
    elif field.annotation == list[str]:
        return StringArrayOptionMetadata(
            name=field.title or "No name",
            description=field.description,
            default=field.default,
            options=(
                field.json_schema_extra.get("options")
                if field.json_schema_extra
                else None
            ),
        )
    elif issubclass(field.annotation, OptionGroup):
        return OptionGroupMetadata(
            name=field.title or "No name",
            description=field.description,
            group={
                k: create_metadata(v) for k, v in field.annotation.model_fields.items()
            },
        )
    elif issubclass(field.annotation, ToggledOptionGroup):
        return ToggledOptionGroupMetadata(
            name=field.title or "No name",
            description=field.description,
            default=field.annotation.model_fields["enabled"].default,
            group={
                k: create_metadata(v)
                for k, v in field.annotation.model_fields.items()
                if k != "enabled"
            },
        )
    elif issubclass(field.annotation, ToggledOptionGroupArray):
        return ToggledOptionGroupArrayMetadata(
            name=field.title or "No name",
            description=field.description,
            multiple=field.annotation.model_fields["multiple"].default,
            groups={
                k: create_metadata(v)
                for k, v in field.annotation.model_fields.items()
                if k != "multiple"
            },
        )
    elif field.annotation == GenerationOptions:
        return GenerationOptionsMetadata(
            **{k: create_metadata(v) for k, v in GenerationOptions.model_fields.items()}
        )
    else:
        raise TypeError("Unsupported annotation")


class GenerationOptionsMetadata(CamelModel):
    taxonomies: ToggledOptionGroupArrayMetadata
    settings: OptionGroupMetadata
    custom_inputs: OptionGroupMetadata
    output_options: ToggledOptionGroupArrayMetadata

    @classmethod
    def create(cls, taxonomies: list[TaxonomyMetadata]):

        return cls(
            taxonomies=TaxonomyArrayMetadata(
                name="Taxonomies", multiple=True, groups={t.name: t for t in taxonomies}
            ),
            settings=create_metadata(GenerationOptions.model_fields["settings"]),
            custom_inputs=create_metadata(
                GenerationOptions.model_fields["custom_inputs"]
            ),
            output_options=create_metadata(
                GenerationOptions.model_fields["output_options"]
            ),
        )
