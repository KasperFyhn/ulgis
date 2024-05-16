from typing import Optional, Literal, Union, Any, Callable, Type

from annotated_types import Ge, Le
from pydantic.fields import FieldInfo

from sqlalchemy.orm import Session
from typing_extensions import Annotated

from fastapi_camelcase import CamelModel
from pydantic import Field, field_validator, BaseModel

from app.models.models import (
    OptionGroup,
    ToggledOptionGroup,
    ToggledOptionGroupArray,
)


class OptionMetadataBase(CamelModel):
    class Config:
        from_attributes = True

    name: str
    description: Optional[str] = Field(
        default=None,
        validation_alias="short_description",
    )


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
    class Config:
        from_attributes = True

    group: dict[str, OptionMetadata]

    @field_validator("group", mode="before")
    def group_validator(cls, group):
        if isinstance(group, list):
            return {v.name: v for v in group}
        return group


class ToggledOptionGroupMetadata(OptionGroupMetadata):
    class Config:
        from_attributes = True

    default: bool = False


class ToggledOptionGroupArrayMetadata(OptionMetadataBase):
    class Config:
        from_attributes = True

    multiple: bool
    groups: dict[str, ToggledOptionGroupMetadata]


def _get_from_metadata(
    metadata: list[Any], clazz: type, cast: Callable[[Any], Any] = lambda x: x
) -> Optional[Any]:
    for field in metadata:
        if isinstance(field, clazz):
            return cast(field)


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
                # alias to get camelCase naming
                v.alias: _create_field_metadata(v, db)
                for k, v in field.annotation.model_fields.items()
            }
            | _populate_from_orm_dependencies(field.annotation, db),
        )
    elif issubclass(field.annotation, ToggledOptionGroup):
        return ToggledOptionGroupMetadata(
            name=field.title or "No name",
            description=field.description,
            default=field.annotation.model_fields["enabled"].default,
            group={
                v.alias: _create_field_metadata(v, db)
                for k, v in field.annotation.model_fields.items()
                if k != "enabled"
            }
            | _populate_from_orm_dependencies(field.annotation, db),
        )
    elif issubclass(field.annotation, ToggledOptionGroupArray):
        return ToggledOptionGroupArrayMetadata(
            name=field.title or "No name",
            description=field.description,
            multiple=field.annotation.model_fields["multiple"].default,
            groups={
                # alias to get camelCase naming
                v.alias: _create_field_metadata(v, db)
                for k, v in field.annotation.model_fields.items()
                if k != "multiple" and k != "extras"
            }
            | _populate_from_orm_dependencies(field.annotation, db),
        )
    else:
        raise TypeError("Unsupported annotation")


def create_metadata(model: Type[BaseModel], db: Session):
    return {
        v.alias: _create_field_metadata(v, db)  # alias to get camelCase naming
        for k, v in model.model_fields.items()
    }
