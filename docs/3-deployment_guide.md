# Deployment guide

The app is intended to run with Docker on a server.

## Database setup
Follow the instructions in the [development guide](2-development_guide.md) for set up of database.

## Environment file
At the root of the project, create `.env` from `.env.example`. Set variables appropriately for your system or server.

When hosted on an actual server with a URL, you may want to set the backend URL to something like `ulgis.com/api/` and direct all requests to that URL to the appropriate port on your host machine. See [Directing requests](#redirecting-requests).

## Run with Docker
Make sure that you have Docker on your system. Then run:
```
docker compose up --build
```

## Redirecting requests
Docker forwards the ports to the host machine. It is thus the host machine's responsibility to ensure that traffic are correctly directed to and from those ports. Pay mind to ports, frontend/backend URLs and allowed origins for backend.

From experience, it might make sense to:
- redirect a user to **one** page without `www` and leave out all `www` in URLs to avoid cross-origin issues,
- set something like `ulgis.com/api/` as the backend API and direct all requests to the appropriate backend port on your host machine,
