import json

from fastapi import APIRouter
from fastapi_camelcase import CamelModel

from app import llm
from app.logger import create_logger


logger = create_logger(__name__)

evaluate_router = APIRouter(prefix="/evaluate")


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


@evaluate_router.post("/evaluate")
async def evaluate(request: EvaluationRequest):
    logger.debug(request)
    prompt = evaluation_prompt.format(request.learning_outcomes)
    response = await llm.generate(prompt)
    logger.debug(response)
    json_response = json.loads(response["response"])

    return {k: v / 10 for k, v in json_response.items()}
