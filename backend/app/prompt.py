from app.models import GenerationOptions


def build_prompt(options: GenerationOptions) -> str:
    prompt = ""

    # background knowledge
    if options.taxonomies:
        prompt += "Here is some background context:\n\n"
        for taxonomy_name, taxonomy_params in options.taxonomies.dict(
            exclude={"multiple"}
        ).items():
            if not taxonomy_params["enabled"]:
                continue
            prompt += "- " + taxonomy_name + "\n\n"
        prompt += "\n"

    # educational settings
    prompt += "Shape your response such that it suits the following education:\n\n"
    prompt += f"Education level: {options.settings.education_level}\n\n"
    if options.settings.education_name:
        prompt += f"Education name: {options.settings.education_name}\n\n"
    prompt += "\n\n"

    # tuned parameters
    # prompt += "Shape your response according to the EU's DigComp 2.2 framework which outlines digital competencies.\n\n"
    # scale_instr = "On a scale from 1 to 5, pay {} attention to '{}'.\n\n"
    # for parameter, value in options.parameters.items():
    #     prompt += scale_instr.format(value, parameter)
    # prompt += "\n\n"

    # custom inputs
    if options.custom_inputs.extra_inputs:
        prompt += "Pay heed to the following information:\n\n"
        for value in options.custom_inputs.extra_inputs:
            if value:
                prompt += f"{value}:\n\n"

    prompt += (
        "Provide learning outcomes that fit with the education and its level. They should be based on the theories in"
        " the provided taxonomies. \n\n"
    )

    # output formatting
    if options.output_options.as_bullet_points.enabled:
        prompt += (
            f"The output should be in {options.output_options.as_bullet_points.number_of_bullets} bullet points"
            f"which can {'' if options.output_options.as_bullet_points.nested else 'NOT'} be nested.\n\n"
        )
    elif options.output_options.prose_description.enabled:
        prompt += (
            f"The output should be a prose description of {options.output_options.prose_description.number_of_words} "
            f"words and NOT bullet points. "
            f"{'Include' if options.output_options.prose_description.headings else 'Do NOT include'} heading.\n\n"
        )

    if options.custom_inputs.custom_instruction:
        prompt += options.custom_inputs.custom_instruction + "\n\n"

    return prompt
