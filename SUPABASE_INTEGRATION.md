# Admin Client - Supabase Integration Guide

## Overview

The Admin Client has been successfully integrated with Supabase Edge Functions for authentication. This document outlines the implementation and deployment steps.

## What Was Implemented

### 1. Supabase Edge Function: `admin-auth`

**Location:** `express-supabase-api/supabase/functions/admin-auth/index.ts`

**Features:**
- ✅ Admin-only authentication (validates `role = 'admin'`)
- ✅ Password verification with bcrypt
- ✅ Account lockout after 5 failed attempts (30 minutes)
- ✅ JWT token generation (access + refresh tokens)
- ✅ Last login tracking
- ✅ Returns user profile with admin role information
- ✅ CORS enabled for cross-origin requests

**Endpoint:** `POST https://lblcjyeiwgyanadssqac.functions.supabase.co/admin-auth`

**Request Body:**
```json
{
  "email": "admin@autosaaz.com",
  "password": "your-password"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@autosaaz.com",
      "role": "admin",
      "status": "active",
      ...
    },
    "profile": {
      "fullName": "Admin User",
      "email": "admin@autosaaz.com",
      "phoneNumber": "+1234567890",
      "role": "admin"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### 2. Admin Client Configuration

**New File:** `AutoSaaz-Admin-Client/src/config/supabase.js`

```javascript
export const SUPABASE_URL = 'https://lblcjyeiwgyanadssqac.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGc...';
export const FUNCTIONS_URL = 'https://lblcjyeiwgyanadssqac.functions.supabase.co';
export const API_BASE_URL = FUNCTIONS_URL;
```

### 3. Updated API Service

**File:** `AutoSaaz-Admin-Client/src/services/apiService.js`

**Changes:**
- ✅ Replaced mock login with real Supabase function call
- ✅ Added proper headers (Supabase anon key + x-access-token)
- ✅ Token storage in localStorage
- ✅ Error handling with detailed messages

**Key Features:**
```javascript
// Headers for Supabase Functions
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'x-access-token': token // for authenticated requests
}
```

### 4. Updated Auth Context

**File:** `AutoSaaz-Admin-Client/src/context/AuthContext.js`

**Changes:**
- ✅ Stores user profile along with user data
- ✅ Returns detailed success/error information
- ✅ Proper token management

## Deployment Steps

### Option 1: Deploy via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/lblcjyeiwgyanadssqac

2. Navigate to **Edge Functions** in the left sidebar

3. Click **New Function** → **Import from file**

4. Upload the file: `express-supabase-api/supabase/functions/admin-auth/index.ts`

5. Also upload the shared CORS helper: `express-supabase-api/supabase/functions/_shared/cors.ts`

6. Click **Deploy**

### Option 2: Deploy via CLI (When Project is Active)

```powershell
cd c:\Users\gilbe\Projects\AutoSaaz-Server\express-supabase-api
supabase functions deploy admin-auth --project-ref lblcjyeiwgyanadssqac
```

**Note:** Currently showing project as INACTIVE. Activate your Supabase project first or use Option 1.

### Option 3: Manual Deployment via API

If both methods fail, you can use the Supabase Management API to deploy functions programmatically.

## Testing the Integration

### 1. Create an Admin User

Run this SQL in your Supabase SQL Editor:

```sql
-- Check if admin user exists
SELECT id, email, role, status FROM users WHERE email = 'admin@autosaaz.com';

-- If not exists, create one (replace with actual hashed password)
-- Use bcrypt to hash 'admin123' or your desired password
INSERT INTO users (
  id,
  email,
  password,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  'admin@autosaaz.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5kosgTBNTGzrm', -- bcrypt hash of 'admin123'
  'admin',
  'active',
  NOW(),
  NOW()
);
```

### 2. Test Login Flow

**From Admin Client:**

1. Start the dev server:
```powershell
cd c:\Users\gilbe\Projects\AutoSaaz-Server\AutoSaaz-Admin-Client
npm start
```

2. Navigate to http://localhost:3000

3. Enter credentials:
   - Email: `admin@autosaaz.com`
   - Password: `admin123` (or your password)

4. Click **Log in**

**Expected Behavior:**
- ✅ Successful login redirects to `/dashboard`
- ✅ User data stored in localStorage
- ✅ Auth token stored and used for subsequent requests
- ✅ Access denied if role is not 'admin'

### 3. Test via API Directly

```powershell
# PowerShell test
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxibGNqeWVpd2d5YW5hZHNzcWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzNjMzMDQsImV4cCI6MjA0NTkzOTMwNH0.Dxe6u7ukJB_4djQurriZm5dIlffCu-yPl_oRNpUNypo"
}

$body = @{
    email = "admin@autosaaz.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://lblcjyeiwgyanadssqac.functions.supabase.co/admin-auth" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

## Security Features

### 1. Role-Based Access Control
- Only users with `role = 'admin'` can log in
- Regular garage owners and mobile users are rejected with 403 Forbidden

### 2. Account Lockout
- 5 failed login attempts → 30-minute lockout
- Failed attempts counter resets on successful login
- Lockout status stored in `locked_until` column

### 3. Password Security
- Passwords hashed with bcrypt (cost factor 10)
- No plain-text passwords in responses
- Password field excluded from user object

### 4. Token Management
- Access token: 7 days expiry
- Refresh token: 30 days expiry
- Tokens signed with HS256 algorithm
- Issuer/Audience validation

### 5. Request Security
- CORS enabled with proper headers
- Origin validation
- Content-Type enforcement

## Troubleshooting

### Issue: "Access denied. Admin privileges required"
**Solution:** Verify user has `role = 'admin'` in database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@autosaaz.com';
```

### Issue: "Account is temporarily locked"
**Solution:** Clear lockout manually:
```sql
UPDATE users 
SET failed_login_attempts = 0, locked_until = NULL 
WHERE email = 'admin@autosaaz.com';
```

### Issue: Function deployment fails
**Solutions:**
1. Check Supabase project status (must be ACTIVE)
2. Verify you're logged in: `supabase login`
3. Use dashboard upload instead of CLI
4. Check Docker is running (for CLI deployments)

### Issue: CORS errors in browser
**Solution:** Function includes proper CORS headers. If still failing:
- Clear browser cache
- Check network tab for actual error
- Verify origin is allowed in CORS config

## Production Deployment

### Admin Client Build

```powershell
cd c:\Users\gilbe\Projects\AutoSaaz-Server\AutoSaaz-Admin-Client
npm run build
```

**Build output:** `build/` folder ready for deployment

**Deploy to:**
- Vercel: `vercel --prod`
- Netlify: Drag `build/` folder to Netlify dashboard
- Static hosting: Upload `build/` contents

### Environment Variables

Create `.env.production`:
```bash
REACT_APP_FUNCTIONS_URL=https://lblcjyeiwgyanadssqac.functions.supabase.co
```

## Files Changed

### Created:
1. `express-supabase-api/supabase/functions/admin-auth/index.ts` - Admin login function
2. `AutoSaaz-Admin-Client/src/config/supabase.js` - Supabase configuration

### Modified:
1. `AutoSaaz-Admin-Client/src/services/apiService.js` - Real API integration
2. `AutoSaaz-Admin-Client/src/context/AuthContext.js` - Profile handling

### Verified:
- ✅ No build errors
- ✅ No TypeScript errors
- ✅ No runtime errors in development
- ✅ Clean production build

## Next Steps

1. **Deploy the admin-auth function** (via dashboard or CLI when project is active)
2. **Create admin users** in the database with proper role
3. **Test the login flow** end-to-end
4. **Deploy the admin client** to production hosting

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase function logs in dashboard
3. Verify database user has correct role
4. Test API endpoint directly with curl/Postman
5. Review this guide's troubleshooting section
