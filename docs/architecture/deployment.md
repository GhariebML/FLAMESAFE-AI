# Deployment Architecture

FlameSafe AI is configured for split cloud deployment (**Vercel** for Next.js frontend + **Render** for FastAPI backend) as well as full local containerized execution (**Docker Compose**).

```mermaid
flowchart LR
    USER["Browser / Researcher"] -->|"HTTPS"| VERCEL["Vercel (Next.js 15 Frontend)<br/>NEXT_PUBLIC_API_URL"]
    VERCEL -->|"CORS + GZip HTTPS JSON (/api/v1)"| RENDER["Render Web Service (FastAPI + Uvicorn)<br/>Dockerfile / render.yaml"]
    VERCEL -. "4.5s Cold-Start Fallback" .-> EDGE["Next.js /api/v1/[...slug] Route"]
    RENDER -->|"SQLAlchemy Async"| DB[("SQLite (render.yaml default) or PostgreSQL + pgvector")]
    RENDER -->|"google-genai SDK"| GEMINI["Google Gemini API"]
    RENDER -->|"HTTPS Allowlist"| NASA["NASA PSI / NTRS"]
```

## Environment Separation

| Environment | Frontend | Backend | Database | AI Provider |
| :--- | :--- | :--- | :--- | :--- |
| **Local Dev** | `npm run dev` (`localhost:3000`) | `uvicorn` (`localhost:8001` or `8000`) | SQLite fallback or local Postgres | `gemini` (if key set) or `mock` |
| **Docker Compose** | Container `flamesafe_frontend:3000` | Container `flamesafe_backend:8000` | `pgvector/pgvector:pg16` | Configurable via `.env` |
| **Cloud Production** | Vercel (`frontend/vercel.json`) | Render (`render.yaml` / `Dockerfile`) | SQLite (`flamesafe_prod.db`) or Managed Postgres | `gemini` (`GEMINI_API_KEY` secret) |
