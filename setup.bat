@echo off
REM PayGuard AI - One-Time Setup Script (Windows)
REM Run this ONCE to set everything up, then use start-backend.bat and start-frontend.bat

echo.
echo ==========================================
echo PayGuard AI - Complete Setup
echo ==========================================
echo.

REM Backend Setup
echo.
echo Step 1: Setting up Backend...
echo ==========================================

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -r requirements.txt

REM Frontend Setup
echo.
echo Step 2: Setting up Frontend...
echo ==========================================

cd frontend
npm install
cd ..

REM Database Migration
echo.
echo Step 3: Running Database Migration...
echo ==========================================

alembic upgrade head

echo.
echo.
echo ==========================================
echo OK SETUP COMPLETE!
echo ==========================================
echo.
echo Next steps:
echo.
echo 1. Create .env file in project root (PowerGuard AI folder):
echo    ---
echo    SUPABASE_URL=https://your-project.supabase.co
echo    SUPABASE_ISSUER=https://your-project.supabase.co/auth/v1
echo    SUPABASE_JWKS_URL=https://your-project.supabase.co/auth/v1/jwks
echo    ---
echo.
echo 2. Create frontend\.env file:
echo    ---
echo    VITE_SUPABASE_URL=https://your-project.supabase.co
echo    VITE_SUPABASE_ANON_KEY=your-anon-key-here
echo    ---
echo.
echo 3. Open TWO PowerShell terminals:
echo.
echo    Terminal 1 (Backend):
echo    $ .\start-backend.bat
echo.
echo    Terminal 2 (Frontend):
echo    $ .\start-frontend.bat
echo.
echo 4. Open http://localhost:5173 and test!
echo.
echo ==========================================
echo.
pause
