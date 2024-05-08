from typing import Literal, Optional, Union

from annotated_types import Ge, Le
from fastapi_camelcase import CamelModel
from pydantic import Field, ConfigDict
from pydantic.fields import FieldInfo
from typing_extensions import Annotated

from app.db.models import Taxonomy

# DATA CLASSES
OptionType = bool | str | float | list[str]


class OptionGroup(CamelModel):
    pass


class ToggledOptionGroup(CamelModel):
    enabled: bool = False


class ToggledOptionGroupArray(CamelModel):
    multiple: bool = True
    pass


class Taxonomies(ToggledOptionGroupArray):
    model_config = ConfigDict(extra="allow")
    pass


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


class CustomInputs(ToggledOptionGroup):
    enabled: bool = False
    extra_inputs: list[str] = Field(title="Extra Inputs", description="Extra inputs")
    custom_instruction: str = Field(
        title="Custom Instruction",
        description="Custom Instruction",
    )


class BulletPointOptions(ToggledOptionGroup):
    enabled: bool = True
    number_of_bullets: int = Field(
        10,
        title="Number of Bullets",
        description="The number of bullets that the LLM is instructed to write out.",
        ge=0,
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
        ge=0,
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
    as_bullet_points: BulletPointOptions = Field(
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
    description: Optional[str] = None


class BooleanOptionMetadata(OptionMetadataBase):
    type: Literal["boolean"] = "boolean"
    initial_value: Optional[bool] = None


class StringOptionMetadata(OptionMetadataBase):
    type: Literal["string"] = "string"
    initial_value: Optional[str] = None
    options: Optional[list[str]] = None
    short: Optional[bool] = None


class StringArrayOptionMetadata(OptionMetadataBase):
    type: Literal["stringArray"] = "stringArray"
    initial_value: Optional[list[str]] = None
    options: Optional[list[str]] = None


class NumberOptionMetadata(OptionMetadataBase):
    type: Literal["number"] = "number"
    initial_value: float = None
    min: float
    max: float
    step: Optional[float] = 1.0


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


class ToggledOptionGroupMetadata(OptionGroupMetadata):
    initial_value: bool


class ToggledOptionGroupArrayMetadata(OptionMetadataBase):
    multiple: bool
    groups: dict[str, ToggledOptionGroupMetadata]


def create_metadata(field: FieldInfo):
    if field.annotation == bool:
        return BooleanOptionMetadata(
            name=field.title or "No name",
            description=field.description,
            initial_value=field.default,
        )
    elif field.annotation == float or field.annotation == int:
        return NumberOptionMetadata(
            name=field.title or "No name",
            description=field.description,
            initial_value=field.default,
            min=float([e for e in field.metadata if isinstance(e, Ge)][0].ge),
            max=float([e for e in field.metadata if isinstance(e, Le)][0].le),
            step=1.0,
        )
    elif field.annotation == str:
        return StringOptionMetadata(
            name=field.title or "No name",
            description=field.description,
            initial_value=field.default,
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
            initial_value=field.default,
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
            initial_value=field.annotation.model_fields["enabled"].default,
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
    custom_inputs: ToggledOptionGroupMetadata
    output_options: ToggledOptionGroupArrayMetadata

    @classmethod
    def create(cls, taxonomies: list[Taxonomy]):

        return cls(
            taxonomies=ToggledOptionGroupArrayMetadata(
                name="Taxonomies",
                description=None,
                multiple=True,
                groups={
                    taxonomy.name: ToggledOptionGroupMetadata(
                        name=taxonomy.name, initial_value=False, group={}
                    )
                    for taxonomy in taxonomies
                },
            ),
            settings=create_metadata(GenerationOptions.model_fields["settings"]),
            custom_inputs=create_metadata(
                GenerationOptions.model_fields["custom_inputs"]
            ),
            output_options=create_metadata(
                GenerationOptions.model_fields["output_options"]
            ),
        )
