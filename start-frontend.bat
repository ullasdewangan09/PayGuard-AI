@echo off
REM PayGuard AI - Frontend Setup & Start Script (Windows)
REM Run this once, then the frontend is ready to go

echo.
echo ==========================================
echo PayGuard AI - Frontend Setup
echo ==========================================
echo.

cd frontend

echo Installing dependencies...
npm install

echo.
echo ==========================================
echo OK Frontend is ready!
echo ==========================================
echo Starting frontend on http://localhost:5173
echo Press Ctrl+C to stop
echo ==========================================
echo.

npm run dev
