from app.db.models import ParameterOrm
from app.models.models import GenerationOptions


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
    if options.custom_inputs.extra_inputs:
        prompt += "Also pay heed to the following information:\n\n"
        for value in options.custom_inputs.extra_inputs:
            if value:
                prompt += f"{value}:\n\n"

    education = options.education_info.education_name or "any education"

    prompt += f"Your output should fit with {education} at {options.education_info.education_level} level."
    if options.education_info.education_description:
        prompt += "\n\n"
        prompt += f"It is described as follows: {options.education_info.education_description}"
    prompt += "\n\n"

    if options.taxonomies.is_any_enabled():
        prompt += (
            "It should be based on the provided taxonomies where you aim for the following levels of "
            "competency for the respective aspects:"
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

    if options.education_info.previous_learning_goals:
        prompt += "Take into account these previous learning goals:\n"
        prompt += options.education_info.previous_learning_goals
        prompt += "\n\n"

    if options.custom_inputs.custom_instruction:
        prompt += "\n\n"
        prompt += options.custom_inputs.custom_instruction

    # output formatting
    if options.output_options.learning_goals.enabled:
        prompt += "Create a list of learning goals."
    elif options.output_options.competency_profile.enabled:
        prompt += "Create a 200 word competency profile."
    elif options.output_options.bullet_points.enabled:
        prompt += (
            f"Create learning outcomes in {options.output_options.bullet_points.number_of_bullets} bullet points "
            f"which can {'' if options.output_options.bullet_points.nested else 'NOT'} be nested."
        )
    elif options.output_options.prose_description.enabled:
        prompt += (
            f"Create a prose description of {options.output_options.prose_description.number_of_words} "
            f"words and NOT bullet points which addresses learning outcomes. "
            f"{'Include' if options.output_options.prose_description.headings else 'Do NOT include'} headings."
        )
    prompt += "\n\n"

    return prompt
