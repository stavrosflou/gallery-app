# Deployment guide and explanation (personalized)

This document explains every file and change I added to your repository, why it exists, and how to deploy the whole stack to a server you already own. It's written for you personally and assumes you have admin access to the server and Docker installed.

---

## 1) What I changed and why

- `gallery_backend/gallery_backend/settings.py`
  - I changed `DEBUG` to read from the environment variable `DJANGO_DEBUG` so you can run the same code in dev and production without editing source. The code treats the string `"True"` as True.
  - `ALLOWED_HOSTS` now comes from `DJANGO_ALLOWED_HOSTS` (comma-separated). For development I left `*` in the example `.env`, but on your production server set a proper hostname or IP.
  - I set `STATIC_URL = '/static/'` and `STATIC_ROOT = BASE_DIR / 'staticfiles'`. This is required so `python manage.py collectstatic` writes production static files to a single folder that nginx can serve.
  - `MEDIA_ROOT` remains the `paintings` folder you already have so existing images continue to work.

- `gallery_backend/Dockerfile`
  - Small, production-minded image based on `python:3.11-slim`.
  - Installs OS-level build deps required by Python packages, installs Python requirements from `requirements.txt`.
  - Copies the Django project and runs `collectstatic`. The collectstatic line is tolerant (`|| true`) during image build in case migrations or other runtime-only items block it in your environment; in production we'll run collectstatic at container start or in the image build pipeline properly.
  - Default runtime `CMD` uses `gunicorn` to serve Django at `0.0.0.0:8000`.

- `gallery_backend/requirements.txt`
  - Minimal set: `Django==5.2.6`, `gunicorn`, `djangorestframework`, `django-cors-headers`, and `Pillow`. Add any additional packages your project uses.

- `gallery-app/Dockerfile`
  - Multistage build: Node stage (`node:18-alpine`) to run `npm ci` and `npm run build`, then copy the result into an `nginx` image. That way nginx serves the final static HTML/CSS/JS without needing Node at runtime.
  - If your Angular project's build command or output path differs, update this Dockerfile accordingly.

- `deploy/nginx/default.conf`
  - Nginx config that:
    - Serves the frontend (single-page app) from `/` and falls back to `index.html` for client-side routing.
    - Serves Django static files from `/static/` by aliasing them to a Docker volume mount `/vol/staticfiles/`.
    - Serves media files at `/media/` aliasing to `/vol/media/`.
    - Reverse-proxies `/api/` to `http://backend:8000/api/`. If your API root is different, change this.

- `docker-compose.yml`
  - Defines 3 services:
    - `backend` — built from `gallery_backend/Dockerfile`. Exposes port 8000 internally (not published on the host). Mounts volumes for static files and media, and mounts `db.sqlite3` for persistence (note: SQLite in a container is OK for small apps but not recommended for production).
    - `frontend` — builds the Angular image; its outputs get baked into the nginx image built in the Dockerfile. The `nginx` service uses the official nginx image and mounts the `default.conf` file.
    - `nginx` — binds host port 80 -> container 80 and reads static/media volumes.
  - Two Docker volumes are created: `static_volume` and `media_volume`.
  - NOTE: per your request the sqlite host mount has been removed so the project runs without a persistent DB file. This means:
    - If your app requires any persistent data (users, admin, models), it will not survive container recreation unless you add a persistent DB or volume later.
    - You can still use Django without a DB if your app is read-only or purely serves static content.

- `gallery_backend/.env`
  - Holds `DJANGO_DEBUG` and `DJANGO_ALLOWED_HOSTS`. You should replace these values with secure production values on your server.

- `README.md` and `DEPLOYMENT_GUIDE.md` (this file) contain run and deployment instructions.

---

## 2) Server preparation — prerequisites

On your target server (assumes a modern Linux distro, e.g., Ubuntu 22.04 LTS):

- Install Docker and docker-compose (or use Docker Compose v2 plugin). Example quick commands:

```powershell
# (Ubuntu example run locally in server shell)
sudo apt update;
sudo apt install -y ca-certificates curl gnupg lsb-release;
sudo mkdir -p /etc/apt/keyrings;
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg;
echo \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null;
sudo apt update;
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin;
sudo usermod -aG docker $USER
```

Note: log out and back in, or run `newgrp docker`, so your user can run `docker` without `sudo`.

Also confirm `git` is installed if you plan to pull the repo directly on the server.

---

## 3) Deployment approach options

Option A — Simple: run everything with `docker-compose` on the server (single node). Good for small apps or staging.

Option B — Production-hardened: push images to a registry (Docker Hub, GitHub Packages, or private registry), and deploy using a process manager, Swarm, or Kubernetes, plus an external database (Postgres) and TLS termination (Traefik/letsencrypt or nginx+certbot). I'll outline Option A below and note changes for Option B.

For now I'll walk you through Option A.

---

## 4) Option A — Step-by-step server deploy (single node, docker-compose)

1) Copy the repository to the server.
   - If the repo is on your machine, `scp`/`rsync` it, or `git clone` on the server.

2) On the server, from the repo root, customize `gallery_backend/.env`:
   - Set `DJANGO_DEBUG=False`.
   - Set `DJANGO_ALLOWED_HOSTS=your.server.domain` (or a comma list of allowed hosts).

3) (Optional but recommended) Create a production `requirements.txt` that includes any extra packages you use.

4) Build and start the stack:

```powershell
# From the repository root on the server
docker compose build
docker compose up -d
```

Notes:
- `docker compose build` builds `backend` and `frontend` images. The frontend build will run `npm ci` and `npm run build` inside the builder image — ensure your server can reach npm registries.
- `docker compose up -d` starts containers in the background.

5) Verify containers are running:

```powershell
docker ps --format "table {{.Names}}	{{.Image}}	{{.Status}}"
```

6) Check logs if something fails:

```powershell
docker compose logs -f nginx
docker compose logs -f backend
```

7) Visit `http://your.server.domain` in a browser. If you used a raw IP and port mapping, use the server IP.

8) Persistent data considerations:
  - You removed the sqlite mount from `docker-compose.yml`. That means there is no persistent DB file on the host. If your app requires persistence (users, uploads metadata, any models), add Postgres or re-enable a persistent sqlite mount.
  - If your app truly needs no DB (static gallery driven entirely by files in `paintings/`), then this is fine.

9) Migrations and superuser

You told me you don't use a database, so the migration and createsuperuser steps are not required and are intentionally omitted. If you later decide to add persistent data or a database, I can add the exact PowerShell commands back in or provide Postgres wiring.

10) Updating code and redeploying

```powershell
# Pull new code, then rebuild and recreate
git pull origin main
docker compose build --no-cache
docker compose up -d
```

---

## 5) TLS (HTTPS) — recommended for production

Option 1 — Terminate with nginx on the same server:
  - Install `certbot` and obtain certificates for your domain.
  - Update `deploy/nginx/default.conf` to include `listen 443 ssl;` and paths to the `fullchain.pem` and `privkey.pem` files, and redirect port 80 to 443.

Option 2 — Use a reverse proxy (Traefik) or cloud load balancer to handle TLS, keeping the stack unchanged.

Quick certbot + nginx example (Ubuntu):

```powershell
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your.server.domain
```

This will automatically update nginx config to use the certificates. If you use the dockerized nginx, you'd instead mount certificate files into the nginx container and reload it.

---

## 6) Production hardening recommendations (short list)

- Use Postgres (or managed DB) instead of SQLite. Add a `db` service or configure an external DB and update `DATABASES` in Django settings (use env variables for credentials).
- Set `DEBUG=False` and a proper `ALLOWED_HOSTS`.
- Use secure secrets: do not keep `SECRET_KEY` in source; use an env var or a secret manager.
- Run `python manage.py collectstatic` explicitly during your build pipeline, or at container start, and ensure `staticfiles` volume is seeded for nginx.
- Configure logging, monitoring, backup for DB and media (paintings), and set up a firewall (allow only necessary ports: 22, 80, 443).

---

## 7) Notes about the nginx static volume wiring

- I mounted static files and media to two Docker volumes (`static_volume` and `media_volume`). The `backend` collects static into `/app/staticfiles` which the `nginx` container reads from `/vol/staticfiles`.
- On first deploy the `static_volume` might be empty. Running `docker compose run --rm backend python manage.py collectstatic` will populate it.

---

## 8) Troubleshooting common issues

- Permission errors when nginx tries to read volumes: ensure files are readable by nginx user (uid 101 or similar) or use `:ro` if files are readable.
- Build failures for the frontend: ensure `package.json` and `package-lock.json` exist in `gallery-app/`, or change the Dockerfile to use `npm install` if no lockfile exists.
- Backend import errors: add missing packages to `gallery_backend/requirements.txt` and rebuild.

---

## 9) If you want, I can:

- Run `docker compose build` and `docker compose up` on your machine now and capture logs (I need Docker available). Tell me to proceed.
- Replace SQLite with Postgres and provide an updated `docker-compose.yml` and Django env settings.
- Add TLS instructions that mount cert files into the dockerized nginx and reload it automatically.

---

Completion note

I created this file to be thorough and actionable. If you want, I can now perform one of the follow-ups (build+run, Postgres migration, TLS wiring). Tell me which and I'll do it next.
