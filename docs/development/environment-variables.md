# Environment Variables Reference

Verified against `backend/app/core/config.py`, `frontend/lib/api/client.ts`, `docker-compose.yml`, and `render.yaml`.

> **Security Rule:** Store real keys and passwords only in git-ignored `.env` / `.env.local` files or cloud secret managers. Never commit credentials.

## Backend (`backend/app/core/config.py`)

| Variable | Required | Default | Service | Description |
| :--- | :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | No | `development` | Backend | Runtime environment (`development`, `production`) |
| `DEBUG` | No | `true` | Backend | Debug flag (`false` in `render.yaml`) |
| `LOG_LEVEL` | No | `INFO` | Backend | Python logging level |
| `BACKEND_HOST` | No | `0.0.0.0` | Backend | Uvicorn bind host |
| `BACKEND_PORT` | No | `8000` | Backend | Default port (Render injects `$PORT`) |
| `API_V1_PREFIX` | No | `/api/v1` | Backend | API v1 URL prefix |
| `ALLOWED_ORIGINS` | No | `["http://localhost:3000", "http://127.0.0.1:3000", "https://flamesafe-ai.vercel.app"]` | Backend | Explicit CORS origins |
| `ALLOWED_ORIGIN_REGEX` | No | `https://.*\.(vercel\.app\|onrender\.com)` | Backend | Regex for Vercel/Render preview URLs |
| `DATABASE_URL` | No | `postgresql+asyncpg://flamesafe:...@localhost:5432/flamesafe_db` | Backend | Primary async PostgreSQL URL |
| `USE_SQLITE_FALLBACK` | No | `true` | Backend | Falls back to SQLite when Postgres is unreachable |
| `SQLITE_DATABASE_URL` | No | `sqlite+aiosqlite:///./flamesafe_dev.db` | Backend | SQLite fallback path |
| `AI_PROVIDER` | No | `gemini` | Backend | `gemini`, `mock`, or `openai` |
| `GEMINI_API_KEY` | For live Gemini | `""` | Backend | Google Gemini API key (keep secret) |
| `GEMINI_MODEL` | No | `gemini-3.8-flash` | Backend | Gemini generation model |
| `GEMINI_EMBEDDING_MODEL` | No | `gemini-embedding-2` | Backend | Gemini embedding model |
| `GEMINI_EMBEDDING_DIMENSIONS` | No | `768` | Backend | Embedding vector dimensionality |
| `AI_FALLBACK_TO_MOCK` | No | `true` | Backend | Falls back to deterministic mock synthesizer on provider error |
| `VECTOR_TOP_K` | No | `5` | Backend | Top-K retrieved evidence chunks |
| `SIMILARITY_THRESHOLD` | No | `0.65` | Backend | Minimum cosine similarity threshold |
| `FLAMESAFE_AUTO_ACQUISITION_MAX_BYTES` | No | `26214400` (25 MB) | Backend | Safety cap for automated in-app file downloads |

## Frontend (`frontend/`)

| Variable | Required | Default | Service | Description |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Recommended | `http://localhost:8001/api/v1` (dev) / `https://flamesafe-backend.onrender.com/api/v1` (prod) | Frontend | Base URL for FastAPI `/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | No | `FlameSafe AI` | Frontend | Application display name (`next.config.ts`) |
