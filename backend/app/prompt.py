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
        phrase_about_target = f"for the {target_type} {target_name} at {level}."
    else:
        phrase_about_target = f"for any {target_type} at {level}."

    if options.output_options.learning_goals.enabled:
        prompt += "Create a list of learning goals " + phrase_about_target
    elif options.output_options.competency_profile.enabled:
        prompt += "Create a 200 word competency profile " + phrase_about_target
    elif options.output_options.bullet_points.enabled:
        prompt += (
            f"Create learning outcomes in {options.output_options.bullet_points.number_of_bullets} bullet points "
            f"which can {'' if options.output_options.bullet_points.nested else 'NOT'} be nested "
            + phrase_about_target
        )
    elif options.output_options.prose_description.enabled:
        prompt += (
            f"Create a prose description of {options.output_options.prose_description.number_of_words} "
            f"words and NOT bullet points which addresses learning outcomes {phrase_about_target} "
            f"{'Include' if options.output_options.prose_description.headings else 'Do NOT include'} headings."
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
