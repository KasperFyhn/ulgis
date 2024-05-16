from setuptools import setup

setup(
    name="app",
    packages=["app"],
    install_requires=[
        "fastapi~=0.110.1",
        "fastapi_camelcase~=2.0.0",
        "uvicorn~=0.29.0",
        "ollama~=0.1.8",
        "pydantic~=2.7.0",
        "alembic",
        "sqlalchemy",
        "pre-commit",
    ],
)
