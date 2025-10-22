# Backend Dockerfile for Django
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH=/app

WORKDIR /src

# system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# install python deps
# copy entire build context (will include the inner `gallery_backend` package)
COPY . /src/

# install python deps (requirements are inside the inner gallery_backend folder)
RUN pip install --no-cache-dir -r /src/gallery_backend/requirements.txt

# ensure python picks up the project package
ENV PYTHONPATH=/src
ENV DJANGO_DEBUG=False

# collect static (no-fail)
RUN python /src/manage.py collectstatic --noinput || true

CMD ["gunicorn", "gallery_backend.wsgi:application", "--chdir", "/src", "--bind", "0.0.0.0:8000"]
