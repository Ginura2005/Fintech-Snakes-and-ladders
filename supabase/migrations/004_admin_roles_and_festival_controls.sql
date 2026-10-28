-- Migration: 004_admin_roles_and_festival_controls.sql
-- Lanka FinTechVerse: Granular Role Management, Audit Logging & Festival Operations

-- 1. Ensure admin_users has role column (default 'admin')
-- Available roles: 'superadmin', 'admin', 'arbiter', 'booth_staff'
ALTER TABLE admin_users 
  ALTER COLUMN role SET DEFAULT 'admin';

-- Promote the primary organizer to superadmin if desired
UPDATE admin_users 
SET role = 'superadmin' 
WHERE LOWER(email) IN ('ginurabuddila@gmail.com', 'admin@thegenerationalpha.com');

-- 2. Create admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT, -- 'run', 'user', 'role', 'announcement', 'settings'
  target_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on audit logs (service role writes & reads, authenticated admins can read)
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON admin_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE LOWER(admin_users.email) = LOWER(auth.jwt() ->> 'email')
    )
  );

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON admin_audit_logs(created_at DESC);

-- 3. Create festival settings table (key-value store for live broadcasts & tournament states)
CREATE TABLE IF NOT EXISTS festival_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public can read festival settings (e.g. announcement banner, tournament state)
ALTER TABLE festival_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read festival settings"
  ON festival_settings FOR SELECT
  USING (TRUE);

-- Seed default announcement & tournament settings
INSERT INTO festival_settings (key, value, updated_by) VALUES
  (
    'announcement',
    '{"enabled": false, "message": "Welcome to Lanka FinTechVerse! Compete for official Sri Lanka FinTech Festival passes.", "type": "info"}'::jsonb,
    'system'
  ),
  (
    'tournament_state',
    '{"status": "open", "deadline": "2026-10-31T23:59:59+05:30", "paused_message": "Arena is temporarily paused for live festival stage ceremonies. Resuming shortly!"}'::jsonb,
    'system'
  )
ON CONFLICT (key) DO NOTHING;
