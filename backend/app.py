import uvicorn
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend import llm
from backend.models import GenerationOptions
from backend.prompt import sample_prompt, build_prompt

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmptyRequest(BaseModel):
    pass


@app.get("/generation_options_metadata")
async def generation_options_metadata():
    return None


@app.post('/generate_outcomes')
async def generate_outcomes(request: GenerationOptions | EmptyRequest):
    if isinstance(request, EmptyRequest):
        request = sample_prompt
    prompt = build_prompt(request)
    response = await llm.generate(prompt)
    return response


if __name__ == "__main__":
    uvicorn.run("backend.app:app", host='localhost', port=8000, reload=True)
