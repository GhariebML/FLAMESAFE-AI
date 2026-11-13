#!/usr/bin/env bash
set -e

echo "===================================================="
echo " FlameSafe AI - Local Environment Setup (Unix/macOS)"
echo "===================================================="

# Check prerequisites
command -v python3 >/dev/null 2>&1 || { echo "Python 3 is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed."; exit 1; }

# Initialize .env from .env.example if missing
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

echo "Setting up Backend (FastAPI)..."
cd backend
python3 -m venv .venv || true
source .venv/bin/activate || true
pip install --upgrade pip
pip install -r requirements.txt
cd ..

echo "Setting up Frontend (Next.js)..."
cd frontend
npm install
cd ..

echo "Seeding database with NASA PSI datasets..."
cd backend
python3 -m scripts.seed_data
cd ..

echo "===================================================="
echo " Setup complete! Start development with: make dev"
echo "===================================================="
