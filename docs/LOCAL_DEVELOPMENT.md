# Local Development & Execution Guide

## 1. System Prerequisites
Before beginning local setup, ensure the following developer tools are installed:
- **Git**: `git --version` (2.30+)
- **Python**: `python --version` (3.11+ recommended)
- **Node.js**: `node --version` (v18.0+ or v20.x LTS)
- **npm**: `npm --version` (v9.0+)
- **Docker & Docker Compose** (Optional for containerized PostgreSQL): `docker --version`

---

## 2. Quick Setup via Automation Scripts

### Windows PowerShell Setup:
```powershell
# Clone the repository
git clone https://github.com/GhariebML/FLAMESAFE-AI.git
cd FLAMESAFE-AI

# Execute automated setup script
.\scripts\setup.ps1
```

### Linux / macOS Setup:
```bash
# Clone the repository
git clone https://github.com/GhariebML/FLAMESAFE-AI.git
cd FLAMESAFE-AI

# Make scripts executable and run
chmod +x scripts/*.sh
./scripts/setup.sh
```

---

## 3. Manual Local Setup (Step-by-Step)

### Step 1: Environment Variables
Copy the template to create your active `.env`:
```bash
# Windows PowerShell:
Copy-Item .env.example .env

# Linux / macOS:
cp .env.example .env
```

### Step 2: Backend Setup
```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv .venv
# Activate on Windows:
.venv\Scripts\Activate.ps1
# Activate on Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations and seed NASA PSI datasets
python -m scripts.seed_data

# Start FastAPI backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API will be live at:
- **API Health**: `http://localhost:8000/api/v1/health`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **ReDoc Reference**: `http://localhost:8000/redoc`

### Step 3: Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
The frontend application will be live at:
- **Client App**: `http://localhost:3000`

---

## 4. Docker Compose Multi-Container Stack
To run the full stack with isolated PostgreSQL and pgvector:
```bash
# Start all services (Database, Backend, Frontend)
docker compose up -d

# Check service logs
docker compose logs -f

# Verify service health
curl http://localhost:8000/api/v1/health

# Stop all services
docker compose down
```

---

## 5. Verification Commands
To verify the entire monorepo in one command:
```bash
# Windows PowerShell:
cd backend; python -m pytest -v; cd ..; cd frontend; npm test; cd ..

# Linux / macOS:
./scripts/validate_project.sh
```
