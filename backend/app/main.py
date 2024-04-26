import logging
import sys

import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import llm
from app.db.base import SessionLocal
from app.db.models import Taxonomy
from app.models import GenerationOptions, GenerationOptionsMetadata
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
logger.setLevel(logging.INFO)
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
                    "name": "As Bullet Points",
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


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="localhost", port=8000, reload=True)
