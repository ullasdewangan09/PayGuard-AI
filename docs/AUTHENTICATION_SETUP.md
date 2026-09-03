# PayGuard AI - Production Authentication Setup Guide

This guide explains how to set up Supabase authentication for PayGuard AI with support for Google, Apple, Email OTP, and Mobile OTP login methods.

## Architecture Overview

PayGuard uses **Supabase Auth** as the identity provider:

```
User → Supabase Auth (Google/Apple/Email/Phone OTP)
    ↓
Supabase JWT Token
    ↓
PayGuard Backend (JWT Verification)
    ↓
Local User Sync & Authorization
    ↓
Payment Operations
```

The authentication flow is:
1. User authenticates via Supabase (OAuth or OTP)
2. Supabase returns a JWT access token
3. Frontend stores token in browser session
4. Frontend passes token to backend APIs
5. Backend verifies token signature and extracts user identity
6. Backend syncs local PayGuard user record
7. Backend enforces authorization rules

**Security Principle**: The frontend is untrusted. Identity must be verified from the token by the backend.

---

## Prerequisites

- Supabase project (free tier available at supabase.com)
- Google Cloud project with OAuth credentials (for Google login)
- Apple Developer account (for Apple login - optional but recommended)
- SMS provider credentials (for phone OTP - optional)

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New project"
4. Enter project name: "payguard-ai"
5. Create a strong database password
6. Select region closest to your deployment
7. Click "Create new project"

Wait for the project to initialize (~5-10 minutes).

---

## Step 2: Get Supabase Configuration

In your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **Publishable/Anonymous Key** → `SUPABASE_PUBLISHABLE_KEY`

3. For JWT verification, you need:
   - **Issuer**: `https://<your-project>.supabase.co/auth/v1`
   - **JWKS URL**: `https://<your-project>.supabase.co/auth/v1/jwks`

**Never commit or expose:**
- Service Role Key (only use on backend for admin tasks)
- API Key secrets
- Any authentication secrets

---

## Step 3: Configure Email OTP

In your Supabase project:

1. Go to **Authentication** → **Providers**
2. Click on "Email"
3. Enable the provider
4. Configure OTP settings:
   - **OTP Expiry**: 15 minutes (recommended)
   - **OTP Length**: 6 digits (recommended)

5. Go to **Email Templates** and customize if desired

Test email OTP:
- For development, Supabase provides a test email OTP: `123456`
- In production, real emails will be sent

---

## Step 4: Configure SMS OTP (Optional)

To enable phone number OTP:

1. Go to **Authentication** → **Providers**
2. Click on "Phone"
3. Enable the provider
4. Choose SMS provider:
   - Twilio (recommended)
   - AWS SNS
   - MessageBird

5. Enter provider credentials

Configure SMS:
- **OTP Expiry**: 15 minutes
- **OTP Length**: 6 digits

---

## Step 5: Configure Google OAuth

### Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable APIs:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"

5. Configure authorized origins and redirect URIs:
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (development)
     - `https://yourdomain.com` (production)
   
   - **Authorized redirect URIs**:
     - `https://<your-project>.supabase.co/auth/v1/callback` (Supabase callback)
     - `http://localhost:5173/auth/callback` (local development)
     - `https://yourdomain.com/auth/callback` (production)

6. Copy the **Client ID** (you'll need this for Supabase)

### Supabase Google Setup

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Click on "Google"
3. Enable the provider
4. Paste your **Google Client ID**
5. Leave the client secret blank (use `Web application` type credentials)
6. Save

---

## Step 6: Configure Apple OAuth (Optional but Recommended)

Apple OAuth is more complex due to their security requirements.

### Apple Developer Setup

1. Go to [Apple Developer](https://developer.apple.com)
2. Sign in and go to **Certificates, Identifiers & Profiles**
3. Create an App ID (if you don't have one):
   - **App ID Prefix**: Team ID
   - **App ID Description**: "PayGuard AI"
   - **Explicit ID**: `com.yourcompany.payguard`
   - Enable "Sign In with Apple"

4. Create a Services ID:
   - Go to **Identifiers** → **Services IDs**
   - Click "+" to create new
   - **Identifier**: `com.yourcompany.payguard.web`
   - Enable "Sign in with Apple"
   - Configure **Web Domain Registration**:
     - Add your domain: `yourdomain.com`

5. Create a private key for Sign in with Apple:
   - Go to **Keys**
   - Click "+" to create new
   - Enable "Sign in with Apple"
   - Download the `.p8` file (save securely)

6. Note these values:
   - **Team ID**: 10-character ID from your developer account
   - **Services ID**: `com.yourcompany.payguard.web`
   - **Key ID**: 10-character ID from the private key
   - **Private Key**: Content of the `.p8` file (keep secure)

### Supabase Apple Setup

1. In Supabase, go to **Authentication** → **Providers**
2. Click on "Apple"
3. Enable the provider
4. Enter:
   - **Team ID**: From Apple Developer
   - **Services ID**: `com.yourcompany.payguard.web`
   - **Key ID**: From private key
   - **Private Key**: Content of `.p8` file (copy entire file content)

5. Save

**Important**: Never commit the Apple private key (`.p8` file) to version control.

---

## Step 7: Configure Redirect URLs

This is critical for OAuth to work correctly.

### Development URLs

In Supabase **Authentication** → **URL Configuration**:

- **Site URL**: `http://localhost:5173`
- **Redirect URLs** (add these):
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/login`
  - `http://127.0.0.1:5173/auth/callback`
  - `http://127.0.0.1:5173/login`

### Production URLs

Update for your production domain:

- **Site URL**: `https://yourdomain.com`
- **Redirect URLs** (add these):
  - `https://yourdomain.com/auth/callback`
  - `https://yourdomain.com/login`
  - `https://app.yourdomain.com/auth/callback` (if using subdomain)

---

## Step 8: Configure Frontend Environment Variables

Create `.env` in the `frontend/` directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Example:
```env
VITE_SUPABASE_URL=https://abcdefghij.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Never put service-role keys or secrets in the frontend `.env`!**

---

## Step 9: Configure Backend Environment Variables

Create or update `.env` in the project root:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_ISSUER=https://your-project.supabase.co/auth/v1
SUPABASE_JWKS_URL=https://your-project.supabase.co/auth/v1/jwks

# Other existing configuration...
DATABASE_URL=sqlite:///./payguard.db
RAZORPAY_KEY_ID=...
# etc.
```

**Security Reminders**:
- ✅ Store `SUPABASE_ISSUER` and `SUPABASE_JWKS_URL` on backend (needed for JWT verification)
- ✅ Store `SUPABASE_URL` on backend
- ❌ Never store service-role key in `.env`
- ❌ Never expose backend secrets to frontend

---

## Step 10: Install Dependencies

### Backend

```bash
cd "PayGuard AI"
pip install -r requirements.txt
```

New dependencies:
- `supabase>=2.0.0` - Supabase Python client

### Frontend

```bash
cd frontend
npm install @supabase/supabase-js
npm install
```

---

## Step 11: Run Database Migration

Apply the authentication schema changes:

```bash
cd "PayGuard AI"
source venv/Scripts/activate  # Windows: venv\Scripts\activate
alembic upgrade head
```

This will:
- Add `external_auth_provider` column to users
- Add `external_subject` column to users
- Add `display_name` column to users
- Make `email` nullable
- Add unique constraint on (external_auth_provider, external_subject)

---

## Step 12: Run the Application

### Backend

```bash
cd "PayGuard AI"
source venv/Scripts/activate
python -m uvicorn app.main:app --reload --port 8000
```

Backend runs on: `http://localhost:8000`

### Frontend (in a new terminal)

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Step 13: Test Authentication Flows

### 1. Test Email OTP Login

1. Open `http://localhost:5173`
2. Click "Continue with Email"
3. Enter email: `test@example.com`
4. Use OTP: `123456` (Supabase dev default)
5. Should redirect to `/app`

### 2. Test Google Login

1. Click "Continue with Google"
2. Google OAuth popup appears
3. Sign in with Google account
4. Should redirect to `/auth/callback` then `/app`

### 3. Test Apple Login

1. Click "Continue with Apple"
2. Apple OAuth popup appears
3. Sign in with Apple credentials
4. Should redirect to `/auth/callback` then `/app`

### 4. Test Phone OTP Login

1. Click "Continue with Mobile"
2. Enter phone number
3. OTP is sent (to real phone in production)
4. Enter OTP
5. Should redirect to `/app`

### 5. Test Protected Routes

1. Clear cookies/localStorage
2. Try to access `http://localhost:5173/app`
3. Should redirect to `/login`

### 6. Test Logout

1. Click user menu in PayGuard
2. Click "Logout"
3. Should redirect to `/login`
4. Token should be cleared

---

## Step 14: Verify Backend JWT Verification

Check that the backend is correctly verifying tokens:

### Test JWT Verification

```bash
# After logging in, copy the token from browser DevTools
# Network tab → /auth/sync response → access_token

curl -H "Authorization: Bearer <your-token>" \
  http://localhost:8000/api/v1/auth/verify
```

Expected response:
```json
{
  "authenticated": true,
  "user_id": "usr_xxxxx"
}
```

### Invalid Token Test

```bash
curl -H "Authorization: Bearer invalid-token" \
  http://localhost:8000/api/v1/auth/verify
```

Expected: `401 Unauthorized`

---

## Security Checklist

Before deploying to production:

- [ ] `SUPABASE_URL` is configured on backend
- [ ] `SUPABASE_ISSUER` and `SUPABASE_JWKS_URL` are configured on backend
- [ ] Frontend `.env` contains ONLY public keys (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] No service-role keys are exposed to frontend
- [ ] No private keys (Apple `.p8` files) are committed to git
- [ ] `redirectTo` URLs in Supabase are set to your production domain
- [ ] HTTPS is enabled for production URLs
- [ ] CORS is properly configured (PayGuard backend allows frontend origin)
- [ ] Database has the authentication migration applied
- [ ] All auth flows tested (Google, Apple, Email, Phone, Logout)
- [ ] Backend JWT verification is working
- [ ] Protected routes are enforcing authentication
- [ ] Old mock user `usr_demo_123` is not used anywhere in production code

---

## Troubleshooting

### "SUPABASE_URL not configured"

**Error**: Backend shows this message

**Solution**: Add `SUPABASE_URL` to backend `.env`

### "Redirect URL mismatch"

**Error**: "redirect_uri_mismatch" or "Invalid redirect URL"

**Solution**: 
1. Check OAuth provider settings (Google, Apple)
2. Check Supabase URL Configuration
3. Ensure the redirect URL exactly matches what you configured

### "OTP not received"

**Error**: User doesn't get OTP email/SMS

**Solution**:
- **Email**: Check spam folder, test with `123456` in development
- **Phone**: Ensure SMS provider is configured and has credits
- Check Supabase logs for delivery failures

### "Token verification fails"

**Error**: Backend returns 401 "Could not validate credentials"

**Solution**:
1. Ensure `SUPABASE_ISSUER` is correct (with `/auth/v1` path)
2. Ensure token is not expired
3. Check token format is "Bearer <token>"
4. Verify JWT was issued by Supabase (check `iss` claim)

### "User not found after authentication"

**Error**: Auth succeeds but PayGuard user creation fails

**Solution**:
1. Check backend logs for `/auth/sync` errors
2. Verify database migration ran (`alembic upgrade head`)
3. Check PayGuard database for the user record

### "Frontend not connecting to Supabase"

**Error**: "Supabase configuration is incomplete"

**Solution**:
1. Check frontend `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Ensure `npm run dev` was restarted after creating `.env`
3. Check browser console for actual error messages

---

## Production Deployment

### Before Going to Production

1. **Set production Supabase URLs** in both frontend and backend `.env`
2. **Enable HTTPS** for all URLs (required for OAuth)
3. **Set strong Supabase database password**
4. **Enable row-level security (RLS)** for additional safety
5. **Set up proper email templates** for OTP emails
6. **Configure SMS provider** with production credentials
7. **Run security audit** (existing PayGuard attack lab)
8. **Test all flows** in staging environment first

### Production Environment Variables

**Backend `.env`** (example):
```env
SUPABASE_URL=https://abc123.supabase.co
SUPABASE_ISSUER=https://abc123.supabase.co/auth/v1
SUPABASE_JWKS_URL=https://abc123.supabase.co/auth/v1/jwks
```

**Frontend `.env`** (example):
```env
VITE_SUPABASE_URL=https://abc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Deployment Checklist

- [ ] SSL certificate installed
- [ ] CORS configured for your domain
- [ ] Rate limiting enabled on auth endpoints
- [ ] Monitoring/alerting set up
- [ ] Backup strategy for database
- [ ] Secrets management in place (never in code)
- [ ] Test login flows on production
- [ ] Have a plan to roll back if needed
- [ ] Document your infrastructure setup
- [ ] Regular security audits scheduled

---

## API Endpoints

### Authentication Endpoints

#### POST `/api/v1/auth/sync`

Synchronize a Supabase-authenticated user with PayGuard database.

**Request** (requires valid Supabase JWT):
```json
{
  "external_auth_provider": "supabase:google",
  "external_subject": "user-uuid-from-supabase",
  "email": "user@example.com",
  "display_name": "John Doe",
  "phone_number": "+1234567890"
}
```

**Response**:
```json
{
  "user_id": "usr_abc123def456",
  "email": "user@example.com",
  "display_name": "John Doe",
  "is_new_user": true
}
```

#### GET `/api/v1/auth/verify`

Verify current authentication status (requires valid JWT).

**Response**:
```json
{
  "authenticated": true,
  "user_id": "usr_abc123def456"
}
```

#### POST `/api/v1/auth/logout`

Logout endpoint (optional - mostly client-side).

**Response**:
```json
{
  "status": "success"
}
```

---

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Google OAuth**: https://supabase.com/docs/guides/auth/social-login/auth-google
- **Apple OAuth**: https://supabase.com/docs/guides/auth/social-login/auth-apple
- **OTP Authentication**: https://supabase.com/docs/reference/javascript/auth-signinwithotp
- **PayGuard Issues**: Check GitHub issues or documentation

---

## Migration from Old Authentication

If you have existing PayGuard users from the old JWT system:

1. **Backup database** before migration
2. **Run migration** to add new columns
3. **Update existing users** by linking to external providers
4. **Test thoroughly** before going to production
5. **Keep old auth working** during transition period with dual support

Example manual migration:
```sql
-- Link existing users to external auth provider
-- (This requires knowing the mapping between old and new user IDs)
UPDATE users 
SET external_auth_provider = 'legacy:payguard',
    external_subject = id
WHERE external_subject IS NULL;
```

---

## FAQ

**Q: Can I use both old and new authentication?**
A: Yes, during migration. The backend supports both JWT formats. But remove old auth before production.

**Q: What if I don't use Google/Apple?**
A: Email + Phone OTP is sufficient. Google and Apple are optional.

**Q: How do I test without real email/phone?**
A: Supabase provides test OTP `123456` in development. Use it for testing.

**Q: Where do I store the Apple `.p8` file?**
A: Only store in Supabase (in provider configuration). Never commit to Git.

**Q: Can users link multiple auth methods?**
A: Not yet in this implementation. Each user has one external provider. We prevent duplicate accounts using unique (provider, subject) constraint.

**Q: What happens if OTP is wrong?**
A: Supabase blocks further attempts (rate limiting). User must wait or request new OTP.

**Q: Is this GDPR compliant?**
A: Yes, but configure proper data retention policies in Supabase.

---

## Next Steps

1. Follow the setup steps above
2. Test all authentication methods locally
3. Deploy to staging environment
4. Run PayGuard security tests (Attack Lab, Evaluation Suite)
5. Deploy to production with proper monitoring

---

**Last updated**: August 2026
**PayGuard AI Version**: 1.0 with Supabase Auth
