# Gallery app (Dockerized)

This repository contains a Django backend (`gallery_backend`) and an Angular frontend (`gallery-app`). The project includes Dockerfiles for both services and an `nginx` service to serve the frontend and reverse-proxy API requests to the backend.

Quick start (requires Docker and docker-compose):

1. From the repo root run:

   docker-compose build
   docker-compose up

2. Open http://localhost in your browser. The Angular app will be served by `nginx` and API requests to `/api/` will be proxied to Django.

Notes:
- The Django settings read `DJANGO_DEBUG` and `DJANGO_ALLOWED_HOSTS` from `gallery_backend/.env`.
- Static files are collected to a Docker volume and served by `nginx` at `/static/`.
- Media files (paintings) are served at `/media/`.
