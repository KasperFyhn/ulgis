from app.models import GenerationOptions


def build_prompt(options: GenerationOptions) -> str:
    prompt = ""

    # background knowledge
    if options.rag_docs:
        prompt += "Here is some background context:\n\n"
        for rag_doc in options.rag_docs:
            prompt += rag_doc + "\n"
        prompt += "\n"

    # educational settings
    prompt += "Shape your response such that it suits the following education:\n\n"
    for setting, value in options.settings.items():
        if not value:
            continue
        prompt += f"{setting}: {value}\n\n"
    prompt += "\n\n"

    # tuned parameters
    prompt += "Shape your response according to the EU's DigComp 2.2 framework which outlines digital competencies.\n\n"
    scale_instr = "On a scale from 1 to 5, pay {} attention to '{}'.\n\n"
    for parameter, value in options.parameters.items():
        prompt += scale_instr.format(value, parameter)
    prompt += "\n\n"

    # custom inputs
    if any(custom_input for custom_input in options.custom_inputs.values()):
        prompt += "Pay heed to the following information:\n\n"
        for custom_input, value in options.custom_inputs.items():
            prompt += f"{custom_input}:\n"
            if isinstance(value, list):
                for member in value:
                    prompt += member + "\n"
            prompt += "\n"

    prompt += (
        "Provide learning outcomes related to digital competencies that fit with the education and its level "
        "and should loosely build on the provided taxonomies. First and foremost, it should adhere to the "
        "EU digital competencies framework, but not necessarily structured accordingly.\n"
    )

    prompt += "\n"

    # output formatting
    for output_instruction, value in options.output_options.items():
        if isinstance(value, bool) and value is False:
            continue
        prompt += f"The output should be written as {output_instruction}.\n\n"

    return prompt
