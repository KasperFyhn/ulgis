import json
import logging
import sys
import uuid

import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi_camelcase import CamelModel
from sqlalchemy.orm import Session, subqueryload

from app import llm
from app.db.base import SessionLocal
from app.db.models import TaxonomyOrm
from app.models.metadata import create_metadata
from app.models.models import GenerationOptions
from app.prompt import build_prompt

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(
    logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
)
logger.addHandler(handler)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/taxonomies")
def get_taxonomies(db: Session = Depends(get_db)):
    return db.query(TaxonomyOrm).options(subqueryload(TaxonomyOrm.group)).all()


@app.get("/taxonomy_descriptions", response_model=dict[str, str])
def get_taxonomy_texts(db: Session = Depends(get_db)) -> dict[str, str]:
    name_and_text = (
        db.query(TaxonomyOrm).add_columns(TaxonomyOrm.name, TaxonomyOrm.text).all()
    )
    return {taxonomy.name: taxonomy.text for taxonomy in name_and_text}


@app.get("/generation_options_metadata")
async def generation_options_metadata(db: Session = Depends(get_db)):
    return create_metadata(GenerationOptions, db)


@app.post("/generate_outcomes")
async def generate_outcomes(request: GenerationOptions, db: Session = Depends(get_db)):
    logger.debug(request)
    prompt = build_prompt(request, get_taxonomy_texts(db))
    response = await llm.generate(prompt)
    return response


_streaming_responses = dict()


@app.post("/start_stream")
async def start_stream(request: GenerationOptions, db: Session = Depends(get_db)):
    logger.debug(request)
    prompt = build_prompt(request, get_taxonomy_texts(db))
    token = str(uuid.uuid4())
    _streaming_responses[token] = llm.generate(prompt, stream=True)
    return {"token": token}


@app.get("/stream_response/{token}")
async def stream_response(token: str):

    async def generator_function():
        stream = _streaming_responses[token]
        async for chunk in await stream:
            t = chunk["response"].replace("\n", "\\n")
            yield f"data: {t}\n\n"
        logger.debug("Removing stream with token '%s' from streaming responses.", token)
        del _streaming_responses[token]

    return StreamingResponse(generator_function(), media_type="text/event-stream")


@app.post("/create_prompt")
async def create_prompt(request: GenerationOptions, db: Session = Depends(get_db)):
    logger.debug(request)
    prompt = build_prompt(request, get_taxonomy_texts(db))
    return prompt


class EvaluationRequest(CamelModel):
    learning_outcomes: str


evaluation_prompt = """
Here are some learning outcomes:

{0}

On a scale from 0 to 10, rate to which degree these learning outcomes address the five digital competencies:
- Communication and Collaboration
- Digital Content Creation
- Information and Data Literacy
- Problem Solving
- Safety

Answer in a JSON and nothing else:
{{
"communicationAndCollaboration": 0-10,
"digitalContentCreation": 0-10,
"informationAndDataLiteracy": 0-10,
"problemSolving": 0-10,
"safety": 0-10
}}
"""


@app.post("/evaluate")
async def evaluate(request: EvaluationRequest):
    logger.debug(request)
    prompt = evaluation_prompt.format(request.learning_outcomes)
    response = await llm.generate(prompt)
    logger.debug(response)
    json_response = json.loads(response["response"])

    return {k: v / 10 for k, v in json_response.items()}


if __name__ == "__main__":

    uvicorn.run("app.main:app", host="localhost", port=8000, reload=True)
