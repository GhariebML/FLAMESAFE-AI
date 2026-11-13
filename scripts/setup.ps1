# ====================================================
# FlameSafe AI - Local Environment Setup (Windows PowerShell)
# ====================================================

Write-Host "Setting up FlameSafe AI Development Environment..." -ForegroundColor Cyan

# 1. Check environment file
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# 2. Setup Backend
Write-Host "`n[1/3] Setting up Backend Python environment..." -ForegroundColor Green
Set-Location backend
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
Set-Location ..

# 3. Setup Frontend
Write-Host "`n[2/3] Setting up Frontend Node environment..." -ForegroundColor Green
Set-Location frontend
npm install
Set-Location ..

# 4. Initialize and Seed Database
Write-Host "`n[3/3] Initializing and Seeding Database..." -ForegroundColor Green
Set-Location backend
python -m scripts.seed_data
Set-Location ..

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "Setup Completed Successfully!" -ForegroundColor Green
Write-Host "To run backend: cd backend; python -m uvicorn app.main:app --reload --port 8000" -ForegroundColor White
Write-Host "To run frontend: cd frontend; npm run dev" -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Cyan
