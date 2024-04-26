from typing import Literal, Optional, Union, Any

from fastapi_camelcase import CamelModel
from pydantic import Field
from typing_extensions import Annotated


class GenerationOptions(CamelModel):
    """
    Corresponds to ui/src/generate/GenerationService.ts:GenerationOptions.
    """
    rag_docs: list[str]
    settings: dict[str, Any]
    parameters: dict[str, Any]
    custom_inputs: dict[str, Any]
    output_options: dict[str, Any]


class OptionMetadataBase(CamelModel):
    name: str
    initial_value: Optional[Any] = None


class BooleanOptionMetadata(OptionMetadataBase):
    type: Literal["boolean"]


class StringOptionMetadata(OptionMetadataBase):
    type: Literal["string"]
    initial_value: Optional[str] = None
    options: Optional[list[str]] = None
    short: Optional[bool] = None


class StringArrayOptionMetadata(OptionMetadataBase):
    type: Literal["stringArray"]
    initial_value: Optional[list[str]] = None
    options: Optional[list[str]] = None


class NumberOptionMetadata(OptionMetadataBase):
    type: Literal["number"]
    initial_value: float | int
    min: float | int
    max: float | int
    step: Optional[float] = 1.0


OptionMetadata = Annotated[
    Union[BooleanOptionMetadata, StringOptionMetadata, StringArrayOptionMetadata, NumberOptionMetadata],
    Field(discriminator="type")
]


class GenerationOptionsMetadata(CamelModel):
    rag_docs: StringArrayOptionMetadata
    settings: list[OptionMetadata]
    parameters: list[OptionMetadata]
    custom_inputs: list[OptionMetadata]
    output_options: list[OptionMetadata]
