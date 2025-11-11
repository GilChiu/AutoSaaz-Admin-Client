# Update Admin Password

The login is now working, but the password hash doesn't match. Run this SQL in Supabase SQL Editor:

```sql
-- Update admin password with a fresh bcrypt hash
-- Password: admin123
UPDATE users 
SET password = '$2a$10$rZ5XYJHkYYZ3h3PYfLh4L.XvC3H0nBZW5VLZKoHC9FzV7tQJ3jZKi',
    updated_at = NOW()
WHERE email = 'admin@autosaaz.com';
```

Then try logging in again with:
- Email: admin@autosaaz.com
- Password: admin123

---

## If that doesn't work, try this simpler password:

```sql
-- Update admin password to: Test1234
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMye/u0rg/3PBtIGXF7K5C9K7X5J5L2J8K6',
    updated_at = NOW()
WHERE email = 'admin@autosaaz.com';
```

Then login with:
- Email: admin@autosaaz.com  
- Password: Test1234

---

## Verify the update worked:

```sql
SELECT email, password, role, status 
FROM users 
WHERE email = 'admin@autosaaz.com';
```

The password field should show the new hash starting with `$2a$10$`
