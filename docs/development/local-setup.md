# Local Development Setup

## 1. Prerequisites

- **Python:** `3.11+`
- **Node.js:** `20+` and `npm`
- **Git**
- **Optional:** Docker & Docker Compose (for PostgreSQL 16 + `pgvector`)

## 2. Clone & Environment Configuration

```bash
git clone https://github.com/GhariebML/FLAMESAFE-AI.git
cd FLAMESAFE-AI
cp .env.example .env
cp frontend/.env.example frontend/.env.local
```

> **Note:** On Windows PowerShell, use `Copy-Item` instead of `cp`. Never commit `.env` or `frontend/.env.local`.

## 3. Option A — Standalone Local Run (SQLite Fallback, No Docker Required)

### Backend (`FastAPI`)
```bash
cd backend
python -m venv .venv
# Linux/macOS: source .venv/bin/activate
# Windows PowerShell: .\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

On startup, `app/main.py` automatically initializes the database schema and seeds the 5 canonical NASA PSI investigations if the database is empty.

### Frontend (`Next.js 15`)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` (API Swagger docs at `http://localhost:8001/docs`).

## 4. Option B — Full Stack with Docker Compose (`PostgreSQL 16 + pgvector`)

```bash
docker compose up --build
```

Services started:
- `flamesafe_db`: `pgvector/pgvector:pg16` on port `5432`
- `flamesafe_backend`: FastAPI on port `8000`
- `flamesafe_frontend`: Next.js on port `3000`

### Running Alembic Migrations (PostgreSQL)
```bash
cd backend
alembic upgrade head
```

## 5. Verification Commands

### Backend Tests
```bash
cd backend
pytest -v
```

### Frontend Checks
```bash
cd frontend
npm run lint
npm run typecheck
npm test
npm run build
```
