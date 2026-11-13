# Troubleshooting & Debugging Guide — FlameSafe AI

## 1. Common Issues & Solutions

### 1.1. Port 8000 or Port 3000 Already in Use
**Symptom**: `ERROR: [Errno 10048] error while attempting to bind on address ('0.0.0.0', 8000): address already in use`

**Solution**:
- **Windows PowerShell**:
  ```powershell
  # Find PID using port 8000
  Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess
  # Terminate conflicting process
  Stop-Process -Id <PID> -Force
  ```
- **Linux / macOS**:
  ```bash
  lsof -i :8000
  kill -9 <PID>
  ```

---

### 1.2. Backend Missing `asyncpg` or SQLite Fallback
**Symptom**: `ModuleNotFoundError: No module named 'asyncpg'` when running without Docker.

**Solution**:
- The backend contains automatic fallback logic: if `asyncpg` is not installed or PostgreSQL is unreachable, it automatically uses `aiosqlite` with SQLite (`flamesafe_dev.db`).
- To install full async drivers:
  ```bash
  pip install aiosqlite asyncpg
  ```

---

### 1.3. Database Seeding Issues / Empty Overview
**Symptom**: `/api/v1/overview` returns zeros for investigations and runs.

**Solution**:
- Force database re-seeding manually:
  ```bash
  cd backend
  python -m scripts.seed_data
  ```
- Check that `data/seed/seed_investigations.json` and `data/seed/seed_documents.json` exist.

---

### 1.4. Frontend Cannot Connect to Backend (CORS or Network Error)
**Symptom**: Frontend shows `API: Offline` or console logs `NetworkError when attempting to fetch resource`.

**Solution**:
1. Verify the backend is running by opening `http://localhost:8000/api/v1/health` in your browser.
2. Check `frontend/.env.local` or `.env` to ensure:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```
3. Check `backend/app/core/config.py` to ensure `ALLOWED_ORIGINS` contains `http://localhost:3000`.

---

### 1.5. Pytest Fails with `ModuleNotFoundError: No module named 'app'`
**Symptom**: Running `pytest` in `backend/` cannot find the `app` package.

**Solution**:
- Always run pytest as a module from `backend/`:
  ```bash
  cd backend
  python -m pytest -v
  ```
- Ensure `pythonpath = ["."]` is configured in `pyproject.toml`.

---

### 1.6. Resetting the Local Database Completely
If schema revisions conflict or you want a fresh start:
- **For SQLite**:
  ```bash
  rm backend/flamesafe_dev.db || del backend\flamesafe_dev.db
  python -m scripts.seed_data
  ```
- **For Docker Compose PostgreSQL**:
  ```bash
  docker compose down -v
  docker compose up -d
  ```
