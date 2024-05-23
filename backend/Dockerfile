FROM python:3.10

WORKDIR /app

# app installation
COPY app app
COPY requirements.txt .
COPY setup.py .
RUN pip3 install -e .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EXPOSE 8000
