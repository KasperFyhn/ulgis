from pydantic import Field

from app.models._base import ToggledOptionGroup, ToggledOptionGroupArray


class LearningGoals(ToggledOptionGroup):
    enabled: bool = True


class LearningOutcomes(ToggledOptionGroup):
    pass


class CompetencyProfile(ToggledOptionGroup):
    pass


class OutputOptions(ToggledOptionGroupArray):
    multiple: bool = False
    learning_goals: LearningGoals = Field(
        title="Learning Goals",
        description="Instruct the LLM to write out a list of learning goals.",
    )
    learning_outcomes: LearningOutcomes = Field(
        title="Learning Outcomes",
        description="Instruct the LLM to write out a list of learning outcomes.",
    )
    competency_profile: CompetencyProfile = Field(
        title="Competency Profile",
        description="Instruct the LLM to write out a competency profile.",
    )

