from app.db.models import ParameterOrm
from app.models.models import (
    GenerationOptions,
    AmpleGenerationOptions,
    ModularEducationInfo,
)


def build_prompt(
    options: GenerationOptions, taxonomy_texts: dict[str, str] = None
) -> str:
    prompt = ""

    # background knowledge
    if options.taxonomies.is_any_enabled():
        prompt += "Below are some descriptions of educational taxonomies:\n\n"
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

    education = options.education_info.education_name or "any education"
    if isinstance(options, AmpleGenerationOptions):
        level = "EQF level " + options.education_info.education_level
    else:
        level = options.education_info.education_level + " level"

    if options.education_info.context_description:
        prompt += "\n\n"
        prompt += (
            f"Your response should fit with {education} at {level} within following contextual information: "
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
    if options.output_options.learning_goals.enabled:
        prompt += f"Create a list of five learning goals for {education} at {level}."
    elif options.output_options.competency_profile.enabled:
        prompt += f"Create a 200 word competency profile for {education} at {level}."
    elif options.output_options.bullet_points.enabled:
        prompt += (
            f"Create learning outcomes in {options.output_options.bullet_points.number_of_bullets} bullet points "
            f"which can {'' if options.output_options.bullet_points.nested else 'NOT'} be nested "
            f"for {education} at {level}."
        )
    elif options.output_options.prose_description.enabled:
        prompt += (
            f"Create a prose description of {options.output_options.prose_description.number_of_words} "
            f"words and NOT bullet points which addresses learning outcomes for {education} at {level}. "
            f"{'Include' if options.output_options.prose_description.headings else 'Do NOT include'} headings."
        )
    prompt += "\n\n"

    return prompt.strip()
