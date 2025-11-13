# Setup JWT Secret for Admin Auth

## The Problem

The admin-auth function needs a `JWT_SECRET` environment variable to sign JWT tokens, but it's not configured in your Supabase project yet.

## Solution: Add JWT_SECRET to Supabase

### Step 1: Generate a Secret Key

Use this command in PowerShell to generate a random secret:

```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Or use this online tool: https://generate-secret.vercel.app/64

**Example secret (for reference):**
```
aB3dE5fG7hI9jK2lM4nO6pQ8rS1tU3vW5xY7zA9bC2dE4fG6hI8jK0lM2nO4pQ6
```

### Step 2: Add to Supabase Project Settings

1. Go to: https://supabase.com/dashboard/project/lblcjyeiwgyanadssqac/settings/functions
2. Scroll down to **"Secrets"** section
3. Click **"Add New Secret"**
4. Name: `JWT_SECRET`
5. Value: Paste your generated secret
6. Click **"Save"**

### Step 3: Restart the Function

After adding the secret, you need to redeploy the function:

```powershell
cd c:\Users\gilbe\Projects\AutoSaaz-Server\express-supabase-api
supabase functions deploy admin-auth --project-ref lblcjyeiwgyanadssqac
```

### Step 4: Test Login Again

Now try logging in with:
- Email: `admin@autosaaz.com`
- Password: `admin123`

## Verification

If the JWT_SECRET is properly set, you should see a successful login with:
- ✅ User data
- ✅ Profile data
- ✅ Access token (JWT)
- ✅ Refresh token (JWT)

## Troubleshooting

### Still seeing "Invalid JWT" error?

1. Check if the secret was saved:
   - Go to Project Settings → Functions → Secrets
   - Verify `JWT_SECRET` is listed

2. Redeploy the function:
   ```powershell
   supabase functions deploy admin-auth --project-ref lblcjyeiwgyanadssqac
   ```

3. Clear browser cache and try again

### Check function logs:

1. Go to: https://supabase.com/dashboard/project/lblcjyeiwgyanadssqac/functions/admin-auth
2. Click on **"Logs"** tab
3. Look for any errors related to JWT_SECRET

## Security Note

⚠️ **Keep your JWT_SECRET secure!** Never commit it to git or share it publicly. This secret is used to sign all authentication tokens for your admin panel.
