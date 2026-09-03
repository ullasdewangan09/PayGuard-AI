# Quick Start Guide - PayGuard AI Authentication

## 🚀 Fastest Way to Test (2 minutes)

### Step 1: One-Time Setup (Run Once)

Double-click or run in PowerShell:
```powershell
.\setup.bat
```

This will:
- ✅ Create Python virtual environment
- ✅ Install backend dependencies
- ✅ Install frontend dependencies  
- ✅ Run database migrations
- Done in ~2-3 minutes!

### Step 2: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Sign up (free)
3. Create project "payguard-ai"
4. Copy your credentials from **Settings → API**

### Step 3: Create .env Files

**File 1: PayGuard AI/.env**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ISSUER=https://your-project.supabase.co/auth/v1
SUPABASE_JWKS_URL=https://your-project.supabase.co/auth/v1/jwks
```

**File 2: frontend/.env**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Start Everything (30 seconds each time)

Open **TWO PowerShell terminals** in the project folder:

**Terminal 1:**
```powershell
.\start-backend.bat
```
Wait for: `Uvicorn running on http://127.0.0.1:8000`

**Terminal 2:**
```powershell
.\start-frontend.bat
```
Wait for: `Local: http://localhost:5173`

### Step 5: Test Your App

Open http://localhost:5173 in browser and test:

✅ **Email OTP** (works immediately):
- Click "Continue with Email"
- Enter your Gmail (or any email)
- Use code: `123456`
- Done!

✅ **Mobile OTP** (UI works, SMS needs setup):
- Click "Continue with Mobile"
- Enter your number
- Use code: `123456`

---

## 📚 What Each Script Does

| Script | What it does |
|--------|-------------|
| `setup.bat` | **ONE-TIME**: Installs everything + migrations |
| `start-backend.bat` | Starts backend (run each time you test) |
| `start-frontend.bat` | Starts frontend (run each time you test) |

---

## 🎯 After First Time

You'll NEVER need to run `setup.bat` again!

Every time you want to test:
1. Open Terminal 1: `.\start-backend.bat`
2. Open Terminal 2: `.\start-frontend.bat`
3. Open http://localhost:5173
4. Test!

That's it! 🎉

---

## 🔌 For Email Testing

Your Gmail works immediately:
1. Click "Continue with Email"
2. Type your Gmail address
3. Enter `123456` as OTP
4. ✓ Logged in!

In production, real OTPs are sent to your actual email.

---

## 📱 For Mobile Testing

SMS OTP UI works right away:
1. Click "Continue with Mobile"
2. Select country, enter your number
3. Enter `123456` as OTP
4. ✓ It works!

To send REAL SMS in production:
- Configure SMS provider in Supabase (Twilio/AWS SNS)
- See [AUTHENTICATION_SETUP.md](docs/AUTHENTICATION_SETUP.md)

---

## 🔐 For Google/Apple Login (Optional)

Want Gmail login? Takes ~10 minutes:
- See Step 5 in [AUTHENTICATION_SETUP.md](docs/AUTHENTICATION_SETUP.md)

---

## ⚡ Quick Troubleshooting

**"ModuleNotFoundError: No module named 'supabase'"**
- Run: `.\setup.bat`

**"VITE_SUPABASE_URL not found"**
- Check frontend/.env exists with correct values
- Restart frontend: Ctrl+C then `.\start-frontend.bat`

**"Could not validate credentials"**
- Check backend .env has SUPABASE_* values
- Restart backend: Ctrl+C then `.\start-backend.bat`

**Port 8000 or 5173 already in use**
- Kill the process using it
- Or edit script to use different port

---

## 🎓 Files Modified

After running `setup.bat`:
- ✅ `venv/` - Created (Python environment)
- ✅ `frontend/node_modules/` - Created (JS packages)
- ✅ `payguard.db` - Database created/updated
- ✅ `.env` files - YOU create these (not in git)

---

## 🚀 That's It!

You're now ready to:
- Test email registration/login
- Test mobile OTP
- Test protected routes
- Prepare for Google/Apple OAuth

Just run the scripts and test! 🎉

---

**Questions?** See [docs/AUTHENTICATION_SETUP.md](docs/AUTHENTICATION_SETUP.md) for detailed guide.
