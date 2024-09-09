import uuid
from typing import Literal

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse

from app import llm
from app.logger import create_logger
from app.models.metadata import create_metadata
from app.models.generationoptions import (
    StandardGenerationOptions,
    ModularGenerationOptions,
    AmpleGenerationOptions,
    GenerationOptions,
)
from app.prompt import build_prompt
from app.routes.data import get_db, get_taxonomy_texts

logger = create_logger(__name__)

generate_router = APIRouter()


@generate_router.get("/generate/generation_options_metadata/{ui_level}")
async def generation_options_metadata(
    ui_level: Literal["Standard", "Modular", "Ample"], db: Session = Depends(get_db)
):
    if ui_level == "Standard":
        return create_metadata(StandardGenerationOptions, db)
    elif ui_level == "Modular":
        return create_metadata(ModularGenerationOptions, db)
    elif ui_level == "Ample":
        return create_metadata(AmpleGenerationOptions, db)


@generate_router.post("/generate/create_prompt")
async def create_prompt(
    request: GenerationOptions,
    db: Session = Depends(get_db),
):
    logger.debug(request)
    prompt = build_prompt(request, get_taxonomy_texts(db))
    return prompt


def _extra_kwargs(generation_options: GenerationOptions):
    if isinstance(generation_options, AmpleGenerationOptions):
        extra_kwargs = generation_options.llm_settings.dict()
    # elif isinstance(generation_options, ModularGenerationOptions):
    #     extra_kwargs = dict(
    #         temperature=generation_options.llm_settings.creativity + .2,
    #         frequency_penalty=max(generation_options.llm_settings.creativity - .5, 0),
    #     )
    else:
        extra_kwargs = {}
    return extra_kwargs


@generate_router.post("/generate/generate_response")
async def generate_outcomes(
    request: GenerationOptions,
    db: Session = Depends(get_db),
):
    logger.debug(request)
    prompt = build_prompt(request, get_taxonomy_texts(db))
    extra_kwargs = _extra_kwargs(request)
    response = await llm.generate(prompt, **extra_kwargs)
    return response


_streaming_responses = dict()


@generate_router.post("/generate/start_stream")
async def start_stream(
    request: GenerationOptions,
    db: Session = Depends(get_db),
):
    logger.debug(request)
    prompt = build_prompt(request, get_taxonomy_texts(db))
    token = str(uuid.uuid4())
    extra_kwargs = _extra_kwargs(request)
    _streaming_responses[token] = llm.generate(prompt, stream=True, **extra_kwargs)
    return {"token": token}


@generate_router.get("/generate/stream_response/{token}")
async def stream_response(token: str):
    async def generator_function():
        stream = _streaming_responses[token]
        async for t in await stream:
            yield f"data: {t}\n\n"
        logger.debug("Removing stream with token '%s' from streaming responses.", token)
        del _streaming_responses[token]

    return StreamingResponse(generator_function(), media_type="text/event-stream")
