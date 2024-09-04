from pydantic import Field

from app.models._base import OptionGroup


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
        "the like to draw inspiration from.",
    )


class AdvancedEducationInfo(ModularEducationInfo):
    education_level: str = Field(
        "6",
        title="EQF Education Level",
        description="Education level in EQF standards.",
        json_schema_extra=dict(options=["1", "2", "3", "4", "5", "6", "7", "8"]),
    )
