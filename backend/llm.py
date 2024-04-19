import logging

import ollama
from ollama import Options

from backend.models import GenerationOptions


async def generate(
        prompt: str,
        model: str = "mistral"):
    return await ollama.AsyncClient().generate(
        prompt=prompt,
        system="You are an educational expert.",  # TODO: describe more
        model=model,
        options=Options(
            num_predict=2000  # failsafe
        )
    )
