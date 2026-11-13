# Deployment & Infrastructure Guide — FlameSafe AI

## 1. Overview & Architecture
FlameSafe AI is containerized using Docker and Docker Compose to ensure reproducible deployment across development workstations, staging environments, and cloud hosting infrastructure.

---

## 2. Docker Services Configuration

### 2.1. `db` (PostgreSQL 16 + pgvector)
- **Image**: `pgvector/pgvector:pg16`
- **Volume**: `postgres_data` mounted to `/var/lib/postgresql/data` for persistent storage across container restarts.
- **Healthcheck**: Uses `pg_isready` with 5-second polling intervals.
- **Network**: `flamesafe_net` bridge network.

### 2.2. `backend` (FastAPI)
- **Build**: `./backend/Dockerfile` using `python:3.11-slim`.
- **Port**: `8000:8000`.
- **Dependencies**: Depends on `db` service reaching healthy state before starting.
- **Environment**: Injected from `.env` or container runtime environment.

### 2.3. `frontend` (Next.js)
- **Build**: `./frontend/Dockerfile` using `node:20-alpine`.
- **Port**: `3000:3000`.
- **Dependencies**: Depends on `backend` service.

---

## 3. Starting the Production / Staging Container Stack
```bash
# 1. Ensure .env is populated with production credentials
cp .env.example .env

# 2. Build and start containers in detached mode
docker compose up --build -d

# 3. Check running status
docker compose ps

# 4. View logs
docker compose logs -f
```

---

## 4. Production Environment Variables Checklist
Before deploying to public infrastructure, ensure the following keys are set:

| Variable | Recommended Production Value | Description |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `production` | Disables verbose debug stack traces in API errors |
| `DEBUG` | `false` | Disables debug mode |
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@host:5432/db` | Production PostgreSQL connection string |
| `ALLOWED_ORIGINS` | `https://your-domain.com` | Strict CORS origin allowlist |
| `AI_PROVIDER` | `gemini` | Configures Google Gemini as primary LLM engine |
| `GEMINI_API_KEY` | *(Secret)* | Valid Google AI Studio API key |
| `USE_SQLITE_FALLBACK`| `false` | Enforces PostgreSQL in production |

---

## 5. Health Check Endpoints for Load Balancers
Cloud load balancers (AWS ALB, GCP Cloud Run, Railway, Render) should monitor:
- **HTTP Path**: `/api/v1/health`
- **Expected Status**: `200 OK`
- **Response Validation**: Checks `data.status == "healthy"` and `data.database_status == "connected"`.
