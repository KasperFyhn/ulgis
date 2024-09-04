from pydantic import Field

from app.models._base import OptionGroup


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
