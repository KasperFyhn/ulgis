import json
import logging
import sys

import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import llm
from app.db.base import SessionLocal
from app.db.models import Taxonomy
from app.models import GenerationOptions, GenerationOptionsMetadata, EvaluationRequest
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
    return db.query(Taxonomy).all()


@app.get("/generation_options_metadata")
async def generation_options_metadata(db: Session = Depends(get_db)):
    return GenerationOptionsMetadata.model_validate(
        {
            "rag_docs": {
                "name": "Taxonomies",
                "type": "stringArray",
                "options": [taxonomy.name for taxonomy in get_taxonomies(db=db)],
            },
            "settings": [
                {
                    "name": "Education Level",
                    "type": "string",
                    "initial_value": "Master",
                    "options": ["Bachelor", "Master", "PhD"],
                },
                {
                    "name": "Faculty",
                    "type": "string",
                    "initial_value": "ARTS",
                    "options": ["ARTS", "NAT", "TECH", "BSS", "HEALTH"],
                },
                {"name": "Education Name", "type": "string", "short": True},
            ],
            "parameters": [
                {
                    "name": "Communication and Collaboration",
                    "type": "number",
                    "initial_value": 3,
                    "min": 1,
                    "max": 5,
                },
                {
                    "name": "Digital Content Creation",
                    "type": "number",
                    "initial_value": 3,
                    "min": 1,
                    "max": 5,
                },
                {
                    "name": "Information and Data Literacy",
                    "type": "number",
                    "initial_value": 3,
                    "min": 1,
                    "max": 5,
                },
                {
                    "name": "Problem Solving",
                    "type": "number",
                    "initial_value": 3,
                    "min": 1,
                    "max": 5,
                },
                {
                    "name": "Safety",
                    "type": "number",
                    "initial_value": 3,
                    "min": 1,
                    "max": 5,
                },
            ],
            "custom_inputs": [
                {"name": "Extra Inputs", "type": "stringArray"},
                {"name": "Instruction", "type": "string"},
            ],
            "output_options": [
                {
                    "name": "Prose Description",
                    "type": "boolean",
                    "initial_value": False,
                },
                {
                    "name": "Bullet Points",
                    "type": "boolean",
                    "initial_value": True,
                },
            ],
        }
    )


@app.post("/generate_outcomes")
async def generate_outcomes(request: GenerationOptions):
    logger.debug(request)
    prompt = build_prompt(request)
    response = await llm.generate(prompt)
    return response


@app.post("/create_prompt")
async def create_prompt(request: GenerationOptions):
    logger.debug(request)
    prompt = build_prompt(request)
    return prompt


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
