# Deployment Guide (Render & Vercel)

FlameSafe AI is configured for split deployment:
- **Backend:** Render Web Service (`render.yaml` & `backend/Dockerfile` / root `Dockerfile`)
- **Frontend:** Vercel Next.js Project (`frontend/vercel.json`)

## 1. Backend on Render

Verified `render.yaml` configuration:
- **Root Directory:** `backend` (Note: `backend/Dockerfile` also supports repo-root `.` Docker build contexts)
- **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path:** `/api/v1/health`
- **Environment Variables:**
  - `ENVIRONMENT=production`
  - `DEBUG=false`
  - `USE_SQLITE_FALLBACK=true`
  - `SQLITE_DATABASE_URL=sqlite+aiosqlite:///./flamesafe_prod.db`
  - `AI_PROVIDER=gemini`
  - `GEMINI_API_KEY=<set in Render Dashboard>`
  - `GEMINI_MODEL=gemini-3.8-flash`
  - `GEMINI_EMBEDDING_MODEL=gemini-embedding-2`
  - `AI_FALLBACK_TO_MOCK=true`

> **Persistence Note:** On Render's free tier without an external PostgreSQL database (`DATABASE_URL`), SQLite (`flamesafe_prod.db`) resides on ephemeral container storage and re-seeds on container restarts. Attach a managed PostgreSQL instance with `pgvector` for durable multi-user persistence.

## 2. Frontend on Vercel

Verified `frontend/vercel.json` configuration:
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Install Command:** `npm install`
- **Security Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`
- **Environment Variables:**
  - `NEXT_PUBLIC_API_URL=https://<your-render-service>.onrender.com/api/v1`

## 3. Cold-Start & CORS Handling

- `backend/app/main.py` enables `GZipMiddleware` and `CORSMiddleware` supporting `https://flamesafe-ai.vercel.app` and `https://.*\.(vercel\.app|onrender\.com)`.
- `frontend/lib/api/client.ts` enforces a `4.5s` timeout on initial `GET` requests, triggers a background `/health` warmup when a cold start is detected, and seamlessly falls back to `/api/v1/[...slug]` so first-time visitors never hit a blank screen.
