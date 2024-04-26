import logging

import ollama
from ollama import Options


async def generate(
        prompt: str,
        model: str = "llama3"):
    return await ollama.AsyncClient().generate(
        prompt=prompt,
        system="You are an educational expert.",  # TODO: describe more
        model=model,
        options=Options(
            num_predict=2000,  # failsafe
        ),
    )
