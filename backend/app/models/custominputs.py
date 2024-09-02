from pydantic import Field

from app.models._base import OptionGroup


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
