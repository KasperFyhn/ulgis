from typing import List

from fastapi_camelcase import CamelModel


class Settings(CamelModel):
    educational_level: str
    faculty: str
    education_name: str


class Parameters(CamelModel):
    problem_solving: float
    information_and_data_literacy: float
    communication_and_collaboration: float
    digital_content_creation: float
    safety: float


class CustomInputs(CamelModel):
    inputs: List[str]
    instruction: str


class OutputOptions(CamelModel):
    bullet_points: bool


class GenerationOptions(CamelModel):
    """
    Corresponds to ui/src/generate/GenerationService.ts:GenerationOptions.
    """
    rag_docs: List[str]
    settings: Settings
    parameters: Parameters
    custom_inputs: CustomInputs
    output_options: OutputOptions


