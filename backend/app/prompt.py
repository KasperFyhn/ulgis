from app.db.models import ParameterOrm
from app.models.generationoptions import (
    GenerationOptions,
    AmpleGenerationOptions,
    ModularGenerationOptions,
)
from app.models.educationinfo import ModularEducationInfo


def build_prompt(
    options: GenerationOptions, taxonomy_texts: dict[str, str] = None
) -> str:
    prompt = ""

    # background knowledge
    if options.taxonomies.is_any_enabled():
        prompt += "Below are descriptions of educational taxonomies as background information:\n\n"
        for taxonomy_name, taxonomy_params in options.taxonomies.iter_taxonomies():
            if not taxonomy_params.enabled:
                continue
            prompt += f"Title: {taxonomy_name}\n\n"
            if taxonomy_texts:
                prompt += f"{taxonomy_texts[taxonomy_name]}"

            prompt += "\n\n"

    # custom inputs
    if (
        isinstance(options, AmpleGenerationOptions)
        and options.custom_inputs.extra_inputs
    ):
        prompt += "Also pay heed to the following information:\n\n"
        for value in options.custom_inputs.extra_inputs:
            if value:
                prompt += f"{value}:\n\n"

    if options.taxonomies.is_any_enabled():
        prompt += (
            "Your response should be based on the provided taxonomies where you aim for the following levels of "
            "competency for the described aspects:"
        )
        prompt += "\n"
        for taxonomy_name, taxonomy_params in options.taxonomies.iter_taxonomies():
            if not taxonomy_params.enabled:
                continue
            prompt += f"- {taxonomy_name}\n"
            for param_name, param_value in taxonomy_params.iter_options():
                if param_value == 0:
                    prompt += f"\t- Ignore '{param_name}'.\n"
                else:
                    prompt += f"\t- Aim for a {ParameterOrm.steps[param_value]} level for '{param_name}'.\n"

        prompt += "\n\n"

    target_type = (options.education_info.target_type or "education").lower()
    target_name = options.education_info.target_name.strip()
    if isinstance(options, AmpleGenerationOptions):
        level = "EQF level " + options.education_info.education_level
    else:
        level = options.education_info.education_level + " level"

    if options.education_info.context_description:
        prompt += "\n\n"
        prompt += (
            f"Your response should fit with the {target_type}"
            f"{' called ' + target_name if target_name else ''} at {level}"
            " where you take into account the following contextual information: "
            f"{options.education_info.context_description}"
        )

        prompt += "\n\n"

    if (
        isinstance(options.education_info, ModularEducationInfo)
        and options.education_info.previous_learning_goals
    ):
        prompt += "Take into account these previous learning goals:\n"
        prompt += options.education_info.previous_learning_goals
        prompt += "\n\n"

    if (
        isinstance(options, AmpleGenerationOptions)
        and options.custom_inputs.custom_instruction
    ):
        prompt += options.custom_inputs.custom_instruction
        prompt += "\n\n"

    # output formatting
    if target_name:
        prompt += f"For the {target_type} {target_name} at {level}, "
    else:
        prompt += f"For any {target_type} at {level}, "

    if options.output_options.learning_goals.enabled:
        prompt += (
            "define clear and broad learning goals that outline the general knowledge, "
            "skills, and competencies students are expected to develop. These should "
            "be aligned with the overall educational objectives and provide a foundation "
            "for the specific learning outcomes."
        )
    elif options.output_options.learning_outcomes.enabled:
        prompt += (
            "specify detailed and measurable learning outcomes that describe the specific "
            "knowledge, skills, and abilities students should demonstrate. These should be "
            "precise, observable, and directly linked to the assessment methods used."
        )
    elif options.output_options.competency_profile.enabled:
        if target_type == "education" or target_type == 'programme':
            prompt += (
                "develop a comprehensive curriculum competency profile that outlines the key "
                "competencies students are expected "
                "to acquire by the time they graduate. This profile should encompass a broad "
                "range of skills, knowledge, and attitudes across all courses, reflecting "
                "the program’s core objectives and aligning with industry standards and "
                "professional requirements."
            )
        else:
            prompt += (
                "create a detailed competency profile that identifies the essential skills, "
                "knowledge, and attitudes students are expected to develop. This profile should "
                "align with the broader program competencies while focusing on the unique "
                f"outcomes of the {target_type}, ensuring students are prepared for both academic "
                "progression and practical application."
            )

    prompt += "\n\n"

    if (
        isinstance(options, ModularGenerationOptions)
        and options.inspiration_seeds.keywords
    ):
        prompt += "Use these keywords as seed for inspiration: " + ", ".join(
            options.inspiration_seeds.keywords
        )

    return prompt.strip()
