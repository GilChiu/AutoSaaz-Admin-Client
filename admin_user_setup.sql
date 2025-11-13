-- Admin User Setup SQL
-- Run this in Supabase SQL Editor to create an admin user

-- 1. Create admin user with pre-hashed password
-- Password: admin123 (bcrypt hashed)
INSERT INTO users (
  id,
  email,
  password,
  role,
  status,
  failed_login_attempts,
  locked_until,
  last_login_at,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  'admin@autosaaz.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5kosgTBNTGzrm', -- bcrypt hash of 'admin123'
  'admin',
  'active',
  0,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  status = 'active',
  password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5kosgTBNTGzrm';

-- 2. Optional: Create a profile for the admin user
INSERT INTO garage_profiles (
  user_id,
  full_name,
  email,
  phone_number,
  status,
  created_at,
  updated_at
)
SELECT 
  u.id,
  'Super Admin',
  'admin@autosaaz.com',
  '+971501234567',
  'active',
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'admin@autosaaz.com'
ON CONFLICT (user_id) DO UPDATE SET
  full_name = 'Super Admin',
  status = 'active';

-- 3. Verify the admin user was created
SELECT 
  id,
  email,
  role,
  status,
  failed_login_attempts,
  locked_until,
  created_at
FROM users 
WHERE email = 'admin@autosaaz.com';

-- 4. Optional: Convert an existing user to admin
-- UPDATE users 
-- SET role = 'admin', status = 'active'
-- WHERE email = 'your-email@example.com';

-- 5. Optional: Reset admin password if needed (password: admin123)
-- UPDATE users 
-- SET password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5kosgTBNTGzrm',
--     failed_login_attempts = 0,
--     locked_until = NULL
-- WHERE email = 'admin@autosaaz.com';
