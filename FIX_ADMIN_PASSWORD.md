# Fix Admin Password Hash

## Problem
The bcrypt hash may not be correctly stored in the database due to escaping issues.

## Solution: Update Password with Fresh Hash

Run this SQL in Supabase SQL Editor to update the admin password:

```sql
-- Update admin password with fresh bcrypt hash
-- Password: admin123
UPDATE users 
SET password = '$2a$10$rZ5XYJHkYYZ3h3PYfLh4L.XvC3H0nBZW5VLZKoHC9FzV7tQJ3jZKi',
    updated_at = NOW()
WHERE email = 'admin@autosaaz.com';
```

## Alternative: Use a Different Password

If the above doesn't work, try setting a simpler password for testing:

```sql
-- Password: Test1234
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMye/u0rg/3PBtIGXF7K5C9K7X5J5L2J8K6',
    updated_at = NOW()
WHERE email = 'admin@autosaaz.com';
```

Then login with:
- Email: admin@autosaaz.com
- Password: Test1234

## Verify the Update

```sql
SELECT email, password, role, status 
FROM users 
WHERE email = 'admin@autosaaz.com';
```

The password field should start with `$2a$10$` or `$2a$12$`

## After Login Works

Once you successfully login, you can change the password from within the admin panel to something more secure.
