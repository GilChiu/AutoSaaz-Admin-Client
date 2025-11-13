# Fix Admin Password - Run This SQL

Copy and paste this EXACT SQL into your Supabase SQL Editor:

```sql
UPDATE users 
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@autosaaz.com';
```

Then login with:
- Email: `admin@autosaaz.com`
- Password: `password`

---

## Alternative - If you want admin123 as password:

```sql
UPDATE users 
SET password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5kosgTBNTGzrm'
WHERE email = 'admin@autosaaz.com';
```

Login with:
- Email: `admin@autosaaz.com`
- Password: `admin123`

---

## Verify it worked:

```sql
SELECT email, LENGTH(password) as hash_length, role, status 
FROM users 
WHERE email = 'admin@autosaaz.com';
```

The `hash_length` should be **60** (a valid bcrypt hash is always 60 characters).
