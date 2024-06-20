# Deployment guide

The app is intended to run with Docker on a server.

## Environment file
At the root of the project, create `.env` from `.env.example`. Set variables appropriately for your system or server.

Docker forwards the ports to the host machine. It is thus the host machine's responsibility to ensure that traffic are correctly directed to those ports. Pay mind to ports, frontend/backend URLs and allowed origins for backend.

## Run with Docker
Make sure that you have Docker on your system. Then run:
```
docker compose up --build
```
