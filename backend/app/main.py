import dotenv
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.data import data_router
from app.routes.evaluate import evaluate_router
from app.routes.generate import generate_router

app = FastAPI()
app.include_router(data_router)
app.include_router(generate_router)
app.include_router(evaluate_router)

dotenv.load_dotenv()
allowed_origins = os.environ.get("ALLOWED_ORIGINS").split(",")

app.add_middleware(
    CORSMiddleware,  # noqa
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="localhost", port=8000, reload=True)
