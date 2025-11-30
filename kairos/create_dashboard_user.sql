-- Create dashboard user for Yield Delta frontend
-- Run this SQL script in your PostgreSQL database (Render.com)

-- Insert user into accounts table (ElizaOS standard schema)
INSERT INTO accounts (
  id,
  email,
  name,
  username,
  details,
  created_at
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000'::uuid,
  'Gugo2942@gmail.com',
  'Dashboard User',
  'dashboard-user',
  '{"source": "yield-delta-dashboard", "role": "dashboard"}'::jsonb,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  details = EXCLUDED.details
RETURNING *;

-- Verify user was created
SELECT id, email, name, username, created_at 
FROM accounts 
WHERE email = 'Gugo2942@gmail.com';
