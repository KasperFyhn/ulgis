import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse

from app import llm
from app.logger import create_logger
from app.routes.data import get_db, get_taxonomy_texts
from app.models.metadata import create_metadata
from app.models.models import GenerationOptions
from app.prompt import build_prompt


logger = create_logger(__name__)

generate_router = APIRouter()


@generate_router.get("/generate/generation_options_metadata")
async def generation_options_metadata(db: Session = Depends(get_db)):
    return create_metadata(GenerationOptions, db)


@generate_router.post("/generate/create_prompt")
async def create_prompt(request: GenerationOptions, db: Session = Depends(get_db)):
    logger.debug(request)
    prompt = build_prompt(request, get_taxonomy_texts(db))
    return prompt


@generate_router.post("/generate/generate_response")
async def generate_outcomes(request: GenerationOptions, db: Session = Depends(get_db)):
    logger.debug(request)
    prompt = build_prompt(request, get_taxonomy_texts(db))
    response = await llm.generate(prompt)
    return response


_streaming_responses = dict()


@generate_router.post("/generate/start_stream")
async def start_stream(request: GenerationOptions, db: Session = Depends(get_db)):
    logger.debug(request)
    prompt = build_prompt(request, get_taxonomy_texts(db))
    token = str(uuid.uuid4())
    _streaming_responses[token] = llm.generate(prompt, stream=True)
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
