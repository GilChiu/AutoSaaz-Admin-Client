# Create Admin User - SQL Script

Run this SQL in your Supabase SQL Editor to create the admin user for login.

## Admin Credentials
- **Email:** `admin@autosaaz.com`
- **Password:** `admin123`

## SQL Script

```sql
-- Create admin user for admin panel login
-- Password: admin123 (hashed with bcrypt)

-- Insert admin user
INSERT INTO users (email, password, role, status)
VALUES (
  'admin@autosaaz.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5kosgTBNTGzrm',
  'admin',
  'active'
)
ON CONFLICT (email) DO UPDATE
SET 
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Create admin profile in garage_profiles (get user_id from previous insert)
INSERT INTO garage_profiles (user_id, full_name, email, phone_number, status)
SELECT 
  id,
  'AutoSaaz Admin',
  'admin@autosaaz.com',
  '+971000000000',
  'active'
FROM users 
WHERE email = 'admin@autosaaz.com'
ON CONFLICT (user_id) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone_number = EXCLUDED.phone_number,
  status = EXCLUDED.status,
  updated_at = NOW();
```

## Verification Query

After running the above SQL, verify the admin user was created:

```sql
-- Check admin user exists
SELECT id, email, role, status, created_at
FROM users 
WHERE email = 'admin@autosaaz.com';

-- Check admin profile exists
SELECT user_id, full_name, email, phone_number, status
FROM garage_profiles gp
JOIN users u ON gp.user_id = u.id
WHERE u.email = 'admin@autosaaz.com';
```

## Steps to Run

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/lblcjyeiwgyanadssqac
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the SQL script above
5. Click **Run** or press `Ctrl+Enter`
6. You should see "Success. No rows returned" message
7. Run the verification query to confirm

## Login Details

Once created, you can login to the admin panel with:
- **Email:** admin@autosaaz.com
- **Password:** admin123

## Security Note

**⚠️ Important:** Change this password immediately after first login in production! This is a default password for development/testing only.
