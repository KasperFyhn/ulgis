from types import NoneType
from typing import Optional, Literal, Union, Any, Callable, Type

from annotated_types import Ge, Le
from fastapi_camelcase import CamelModel
from pydantic import Field, field_validator, BaseModel
from pydantic.fields import FieldInfo  # noqa
from sqlalchemy.orm import Session
from typing_extensions import Annotated

from app.models.models import (
    OptionGroup,
    ToggledOptionGroup,
    ToggledOptionGroupArray,
    GenerationOptions,
)


class OptionMetadataBase(CamelModel):
    class Config:
        from_attributes = True

    name: str
    description: Optional[str] = Field(
        default=None,
        validation_alias="short_description",
    )
    ui_level: Literal["Inherit", "Standard", "Modular", "Ample"] = "Inherit"


class BooleanOptionMetadata(OptionMetadataBase):
    type: Literal["boolean"] = "boolean"
    default: Optional[bool] = None


class StringOptionMetadata(OptionMetadataBase):
    class Config:
        from_attributes = True

    type: Literal["string"] = "string"
    default: Optional[str] = None
    options: Optional[list[str] | dict[str, list[str]]] = None
    short: Optional[bool] = None


class StringArrayOptionMetadata(OptionMetadataBase):
    class Config:
        from_attributes = True

    type: Literal["stringArray"] = "stringArray"
    default: Optional[list[str]] = None
    options: Optional[list[str]] = None


class NumberOptionMetadata(OptionMetadataBase):
    class Config:
        from_attributes = True

    type: Literal["number"] = "number"
    default: int | float = None
    min: Optional[int | float] = None
    max: Optional[int | float] = None
    step: Optional[int | float] = 1.0
    steps: Optional[list[str]] = None


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
    class Config:
        from_attributes = True

    type: Literal["optionGroup"] = "optionGroup"
    group: dict[str, OptionMetadata]

    @field_validator("group", mode="before")
    def group_validator(cls, group):
        if isinstance(group, list):
            return {v.name: v for v in group}
        return group


class ToggledOptionGroupMetadata(OptionMetadataBase):
    class Config:
        from_attributes = True

    type: Literal["toggledOptionGroup"] = "toggledOptionGroup"
    default: bool = False
    group: dict[str, OptionMetadata]

    @field_validator("group", mode="before")
    def group_validator(cls, group):
        if isinstance(group, list):
            return {v.name: v for v in group}
        return group


class ToggledOptionGroupArrayMetadata(OptionMetadataBase):
    class Config:
        from_attributes = True

    type: Literal["toggledOptionGroupArray"] = "toggledOptionGroupArray"
    multiple: bool
    groups: dict[str, ToggledOptionGroupMetadata]


def _get_from_field_metadata(
    field: FieldInfo, clazz: type, cast: Callable[[Any], Any] = lambda x: x
) -> Optional[Any]:
    for prop in field.metadata:
        if isinstance(prop, clazz):
            return cast(prop)


def _get_from_json_schema_extra(
    field: FieldInfo, property_name: str, default_value: Any
) -> Any:
    if field.json_schema_extra and property_name in field.json_schema_extra:
        return field.json_schema_extra[property_name]
    else:
        return default_value


def _model_fields_metadata(model: Type[BaseModel], db: Session, *exclude: str) -> dict[
    str,
    BooleanOptionMetadata
    | NumberOptionMetadata
    | StringOptionMetadata
    | StringArrayOptionMetadata
    | OptionGroupMetadata
    | ToggledOptionGroupMetadata
    | ToggledOptionGroupArrayMetadata,
]:
    return {
        v.alias: _create_field_metadata(v, db)
        for k, v in model.model_fields.items()
        if k not in exclude
    }


def _populate_from_orm_dependencies(
    model: Type[OptionGroup | ToggledOptionGroup | ToggledOptionGroupArray], db: Session
):
    if "depends" in model.model_config:
        return {
            orm.name: orm for orm in (db.query(model.model_config["depends"]).all())
        }
    else:
        return {}


def _create_field_metadata(
    field: FieldInfo, db: Session
) -> (
    BooleanOptionMetadata
    | NumberOptionMetadata
    | StringOptionMetadata
    | StringArrayOptionMetadata
    | OptionGroupMetadata
    | ToggledOptionGroupMetadata
    | ToggledOptionGroupArrayMetadata
):
    if field.annotation == bool:
        return BooleanOptionMetadata(
            name=field.title or field.alias,
            description=field.description,
            ui_level=_get_from_json_schema_extra(field, "ui_level", "Inherit"),
            default=field.default,
        )
    elif field.annotation == float or field.annotation == int:
        return NumberOptionMetadata(
            name=field.title or field.alias,
            description=field.description,
            ui_level=_get_from_json_schema_extra(field, "ui_level", "Inherit"),
            default=field.default,
            min=_get_from_field_metadata(field, Ge, lambda ge: float(ge.ge)),
            max=_get_from_field_metadata(field, Le, lambda le: float(le.le)),
            step=_get_from_json_schema_extra(field, "step", 1),
            steps=_get_from_json_schema_extra(field, "steps", None),
        )
    elif field.annotation == str:
        return StringOptionMetadata(
            name=field.title or field.alias,
            description=field.description,
            ui_level=_get_from_json_schema_extra(field, "ui_level", "Inherit"),
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
            name=field.title or field.alias,
            description=field.description,
            ui_level=_get_from_json_schema_extra(field, "ui_level", "Inherit"),
            default=field.default,
            options=(
                field.json_schema_extra.get("options")
                if field.json_schema_extra
                else None
            ),
        )
    elif issubclass(field.annotation, OptionGroup):
        return OptionGroupMetadata(
            name=field.title or field.alias,
            description=field.description,
            ui_level=_get_from_json_schema_extra(field, "ui_level", "Inherit"),
            group=_model_fields_metadata(field.annotation, db)
            | _populate_from_orm_dependencies(field.annotation, db),
        )
    elif issubclass(field.annotation, ToggledOptionGroup):
        return ToggledOptionGroupMetadata(
            name=field.title or field.alias,
            description=field.description,
            ui_level=_get_from_json_schema_extra(field, "ui_level", "Inherit"),
            default=field.annotation.model_fields["enabled"].default,
            group=_model_fields_metadata(field.annotation, db, "enabled")
            | _populate_from_orm_dependencies(field.annotation, db),
        )
    elif issubclass(field.annotation, ToggledOptionGroupArray):
        return ToggledOptionGroupArrayMetadata(
            name=field.title or field.alias,
            description=field.description,
            ui_level=_get_from_json_schema_extra(field, "ui_level", "Inherit"),
            multiple=field.annotation.model_fields["multiple"].default,
            groups=_model_fields_metadata(field.annotation, db, "multiple")
            | _populate_from_orm_dependencies(field.annotation, db),
        )
    else:
        raise TypeError("Unsupported annotation")


def create_metadata(model: Type[GenerationOptions], db: Session):
    return {
        v.alias: _create_field_metadata(v, db)  # alias to get camelCase naming
        for k, v in model.model_fields.items()
        if v.annotation != NoneType  #
    }
