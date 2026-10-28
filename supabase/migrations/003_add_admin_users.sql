-- Migration: 003_add_admin_users.sql
-- Lanka FinTechVerse: Database-driven Admin Privileges
-- Admin access is managed entirely via the database (no hardcoding in application code).

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial administrator emails into database table
INSERT INTO admin_users (email, role) VALUES
  ('ginurabuddila@gmail.com', 'admin'),
  ('buddilaginura@gmail.com', 'admin'),
  ('admin@thegenerationalpha.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to query their own admin row
CREATE POLICY "Users can check their own admin status"
  ON admin_users FOR SELECT
  USING (LOWER(email) = LOWER(auth.jwt() ->> 'email'));

-- Case-insensitive index for lightning-fast lookup
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users (LOWER(email));
