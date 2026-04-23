CREATE SCHEMA IF NOT EXISTS pc;

-- Поддержка case-insensitive email
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS pc.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS pc.user_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES pc.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pc.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES pc.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  kind TEXT NOT NULL DEFAULT 'server',
  hostname TEXT,
  os TEXT,
  arch TEXT,
  capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_online TIMESTAMPTZ,
  last_version TEXT,
  claude_logged_in BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_devices_user ON pc.devices(user_id);

CREATE TABLE IF NOT EXISTS pc.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES pc.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES pc.devices(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  path TEXT,
  instructions TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_user ON pc.projects(user_id);

CREATE TABLE IF NOT EXISTS pc.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES pc.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES pc.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New chat',
  claude_session_id TEXT,
  model TEXT NOT NULL DEFAULT 'sonnet',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON pc.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_project ON pc.sessions(project_id);

CREATE TABLE IF NOT EXISTS pc.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES pc.sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tool_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_session ON pc.messages(session_id);
