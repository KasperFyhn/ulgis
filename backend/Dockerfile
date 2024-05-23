FROM python:3.10

WORKDIR /app

# app installation
COPY app app
COPY requirements.txt .
COPY setup.py .
RUN pip3 install -e .

# database setup and seeding (TODO: should be mounted in the future instead)
COPY db-setup db-setup
WORKDIR /app/db-setup
RUN alembic upgrade head
RUN python3 seed_database.py

WORKDIR /app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EXPOSE 8000
