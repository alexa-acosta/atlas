FROM node:22-slim AS frontend

WORKDIR /app/react-with-flask
COPY react-with-flask/package*.json ./
RUN npm ci

COPY react-with-flask/ ./
RUN npm run build


FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    poppler-utils \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . ./
COPY --from=frontend /app/react-with-flask/dist /app/react-with-flask/dist

CMD ["sh", "-c", "cd react-with-flask/api && exec gunicorn --bind 0.0.0.0:${PORT:-10000} --workers 1 --threads 4 --timeout 120 api:app"]
