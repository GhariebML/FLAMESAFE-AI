#!/usr/bin/env bash
set -e

echo "Starting FlameSafe AI Development Stack..."

# Trap CTRL+C and kill background jobs
trap 'kill $(jobs -p)' EXIT

cd backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

wait $BACKEND_PID $FRONTEND_PID
