import os
from typing import Optional

import ollama
from ollama import Options
from openai import AsyncClient
from openai.types.chat import ChatCompletionChunk

_system_prompt = (
    "You are an expert on education and learning. Your purpose is to provide inspiration to"
    "teachers and staff in educational institutions about learning goals for courses, programs"
    "and educations. Be creative while retaining a focus on core values of education. Keep responses"
    "concise and to the point."
)


async def generate(
    prompt: str,
    stream: bool = False,
    model: Optional[str] = None,
    temperature: float = None,
):
    if os.environ.get("OPENAI_API_KEY"):
        client = AsyncClient(api_key=os.environ.get("OPENAI_API_KEY"))
        response_coro = client.chat.completions.create(
            messages=[
                {"role": "system", "content": _system_prompt},
                {"role": "user", "content": prompt},
            ],
            model=model or "gpt-3.5-turbo",
            temperature=temperature,
            stream=True,
            max_tokens=2000,
        )
        if stream:

            async def generator():
                async for chunk in await response_coro:
                    chunk: ChatCompletionChunk
                    prediction: Optional[str] = chunk.choices[0].delta.content
                    if prediction is None:
                        break
                    yield prediction.replace("\n", "\\n")

            return generator()
        else:
            return await response_coro

    else:
        response_coro = ollama.AsyncClient().generate(
            prompt=prompt,
            system=_system_prompt,
            model="llama3",
            options=Options(
                num_predict=2000,  # failsafe
            ),
            stream=stream,
        )
        if stream:

            async def generator():
                async for chunk in await response_coro:
                    prediction: str = chunk["response"]
                    yield prediction.replace("\n", "\\n")

            return generator()
        else:
            return await response_coro
