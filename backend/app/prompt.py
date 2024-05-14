from app.models import GenerationOptions


_attention_dict = {
    0: "no",
    1: "very low",
    2: "low",
    3: "moderate",
    4: "high",
    5: "very high",
}


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
            prompt += "\n"
            for param_name, param_value in taxonomy_params.iter_options():
                prompt += f"- Pay {_attention_dict[param_value]} attention to '{param_name}'.\n"

        prompt += "\n"

    # custom inputs
    if options.custom_inputs.extra_inputs:
        prompt += "Pay heed to the following information:\n\n"
        for value in options.custom_inputs.extra_inputs:
            if value:
                prompt += f"{value}:\n\n"

    education = options.settings.education_name or "an education"
    prompt += f"Provide learning outcomes that fit with {education} at {options.settings.education_level} level."
    if options.taxonomies.is_any_enabled():
        prompt += " They should be based on the provided taxonomies."
    prompt += "\n\n"

    # output formatting
    if options.output_options.as_bullet_points.enabled:
        prompt += (
            f"The output should be in {options.output_options.as_bullet_points.number_of_bullets} bullet points "
            f"which can {'' if options.output_options.as_bullet_points.nested else 'NOT'} be nested.\n\n"
        )
    elif options.output_options.prose_description.enabled:
        prompt += (
            f"The output should be a prose description of {options.output_options.prose_description.number_of_words} "
            f"words and NOT bullet points. "
            f"{'Include' if options.output_options.prose_description.headings else 'Do NOT include'} headings.\n\n"
        )

    if options.custom_inputs.custom_instruction:
        prompt += options.custom_inputs.custom_instruction + "\n\n"

    return prompt
