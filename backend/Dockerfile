FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for scientific packages and PostgreSQL driver
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Support both build contexts: repo root (.) and ./backend
COPY . /tmp/build_ctx

RUN if [ -f /tmp/build_ctx/backend/requirements.txt ]; then \
      cp -r /tmp/build_ctx/backend/. /app/; \
    else \
      cp -r /tmp/build_ctx/. /app/; \
    fi && \
    rm -rf /tmp/build_ctx

# Install python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Expose default FastAPI port
EXPOSE 8000

# Run FastAPI with Uvicorn (respects Render's dynamic $PORT environment variable)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
