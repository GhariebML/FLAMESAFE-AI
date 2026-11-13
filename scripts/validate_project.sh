#!/usr/bin/env bash
set -e

echo "Running FlameSafe AI Monorepo Validation..."

echo "1. Checking Python backend tests..."
cd backend
python3 -m pytest -v
cd ..

echo "2. Checking Frontend tests..."
cd frontend
node --test tests/*.test.js
cd ..

echo "3. Validating project configuration..."
python3 -c "import json; json.load(open('data/seed/seed_investigations.json')); print('Seed investigations JSON valid')"
python3 -c "import json; json.load(open('data/seed/seed_documents.json')); print('Seed documents JSON valid')"

echo "All project validations passed successfully!"
