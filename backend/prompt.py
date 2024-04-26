import logging
import sys

from backend.models import GenerationOptions


def build_prompt(options: GenerationOptions) -> str:
    prompt = ""

    # background knowledge
    prompt += "Here is some background context:\n"
    for rag_doc in options.rag_docs:
        prompt += rag_doc + "\n"
    prompt += "\n"

    # educational settings
    prompt += "Shape your response such that it suits the following education:\n"
    for setting, value in options.settings.items():
        prompt += f"{setting}: {value}\n"
    prompt += "\n"

    # tuned parameters
    prompt += "Shape your response according to the EU's DigComp 2.2 framework which outlines digital competencies.\n"
    scale_instr = "On a scale from 1 to 5, pay {} attention to '{}'.\n"
    for parameter, value in options.parameters.items():
        prompt += scale_instr.format(parameter, value)
    prompt += "\n"

    # custom inputs
    prompt += "Pay heed to the following information:\n"
    for custom_input, value in options.custom_inputs.items():
        prompt += f"{custom_input}:\n"
        if isinstance(value, list):
            for member in value:
                prompt += member + "\n"
        prompt += "\n"

    prompt += ("Provide learning outcomes related to digital competencies that fit with the education and its level "
               "and should loosely build on the provided taxonomies. First and foremost, it should adhere to the "
               "EU digital competencies framework, but not necessarily structured accordingly.\n")

    prompt += "\n"

    # output formatting
    prompt += "These are instructions for output formatting:\n"
    for output_instruction, value in options.output_options.items():
        if isinstance(value, bool) and value is False:
            continue
        prompt += f"{output_instruction}: {value}\n"

    return prompt
