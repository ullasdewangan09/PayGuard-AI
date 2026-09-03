#!/bin/bash
# PayGuard AI - Backend Setup & Start Script
# Run this once, then the backend is ready to go

echo "=========================================="
echo "PayGuard AI - Backend Setup"
echo "=========================================="

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate venv
source venv/Scripts/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Running database migrations..."
alembic upgrade head

echo ""
echo "=========================================="
echo "✅ Backend is ready!"
echo "=========================================="
echo "Starting backend on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo "=========================================="
echo ""

python -m uvicorn app.main:app --reload
