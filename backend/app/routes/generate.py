import uuid
from typing import Literal

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse

from app import llm
from app.db.models import TaxonomyOrmItem
from app.logger import create_logger
from app.models.generationoptions import (
    StandardGenerationOptions,
    ModularGenerationOptions,
    AmpleGenerationOptions,
    GenerationOptions,
)
from app.models.metadata import create_metadata
from app.prompt import build_prompt
from app.routes.data import get_db, get_taxonomies

logger = create_logger(__name__)

generate_router = APIRouter(prefix="/generate")


def taxonomies_info(db: Session = Depends(get_db)) -> dict[str, TaxonomyOrmItem]:
    return {t.name: t for t in get_taxonomies(db)}


@generate_router.get("/generation_options_metadata/{ui_level}")
async def generation_options_metadata(
    ui_level: Literal["Standard", "Modular", "Ample"], db: Session = Depends(get_db)
):
    if ui_level == "Standard":
        return create_metadata(StandardGenerationOptions, db)
    elif ui_level == "Modular":
        return create_metadata(ModularGenerationOptions, db)
    elif ui_level == "Ample":
        return create_metadata(AmpleGenerationOptions, db)


@generate_router.post("/create_prompt")
async def create_prompt(
    request: GenerationOptions,
    db: Session = Depends(get_db),
):
    logger.debug(request)
    prompt = build_prompt(request, taxonomies_info(db))
    return prompt


def _extra_kwargs(generation_options: GenerationOptions):
    if isinstance(generation_options, AmpleGenerationOptions):
        extra_kwargs = generation_options.llm_settings.dict()
    else:
        extra_kwargs = {}
    return extra_kwargs


@generate_router.post("/generate_response")
async def generate_outcomes(
    request: GenerationOptions,
    db: Session = Depends(get_db),
):
    logger.debug(request)
    prompt = build_prompt(request, taxonomies_info(db))
    extra_kwargs = _extra_kwargs(request)
    response = await llm.generate(prompt, **extra_kwargs)
    return response


_streaming_responses = dict()


@generate_router.post("/start_stream")
async def start_stream(
    request: GenerationOptions,
    db: Session = Depends(get_db),
):
    logger.debug(request)
    prompt = build_prompt(request, taxonomies_info(db))
    token = str(uuid.uuid4())
    extra_kwargs = _extra_kwargs(request)
    _streaming_responses[token] = llm.generate(prompt, stream=True, **extra_kwargs)
    return {"token": token}


@generate_router.get("/stream_response/{token}")
async def stream_response(token: str):
    async def generator_function():
        stream = _streaming_responses[token]
        async for t in await stream:
            yield f"data: {t}\n\n"
        logger.debug("Removing stream with token '%s' from streaming responses.", token)
        del _streaming_responses[token]

    return StreamingResponse(generator_function(), media_type="text/event-stream")
