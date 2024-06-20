# Development guide

## Setup of project

### Frontend

Requires Node 18+. Install with `npm` or `yarn`:

```
cd ui
npm install
```

### Backend
Requires Python 3.10. It is recommended to create a virtual environment.

For Mac/Linux:
```
cd backend
python3 -m venv venv
source venv/bin/activate
```

Then run setup:

```
pip3 install -e .
```

### Database
Assuming that you are still in `ulgis/backend`:

```
mkdir db
cd db-setup
alembic upgrade head
python3 seed_database.py
```

### LLM Service
For local development you can use an Ollama server to avoid sending requests to OpenAI. It works best if you have a machine with a GPU. To install Ollama, look here: https://ollama.com/.

The backend will use Ollama if no OpenAI API key is provided in the environment file.

### Environment files
Create a file `backend/.env` with the contents of `backend/.env.example`.

Set the correct path for the database file (you can do relative paths, but it can be tricky depending on how you run the app). Set the OpenAI API key or remove/comment out the line to use Ollama.

Also create `ui/.env` from `ui/.env.example`. By default you don't need to change anything. It just needs a URL for the backend.

## Running locally
To start the frontend server, run from `ulgis/ui`:
```
npm run start
```

To start the backend server, run from `ulgis/backend`:
```
python3 app/main.py
```