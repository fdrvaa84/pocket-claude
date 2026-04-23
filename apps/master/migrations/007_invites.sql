-- Invite-коды: админ генерит, юзер регистрируется по коду.
CREATE TABLE IF NOT EXISTS pc.invite_codes (
  code TEXT PRIMARY KEY,
  created_by UUID NOT NULL REFERENCES pc.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_by UUID REFERENCES pc.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,                  -- NULL = бессрочно
  note TEXT                                -- кому выдал, для памяти
);
CREATE INDEX IF NOT EXISTS idx_invites_creator ON pc.invite_codes(created_by);
CREATE INDEX IF NOT EXISTS idx_invites_unused ON pc.invite_codes(used_by) WHERE used_by IS NULL;

-- Логин-аудит: чтоб потом можно было увидеть подозрительные паттерны.
CREATE TABLE IF NOT EXISTS pc.auth_audit (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email TEXT,
  ip TEXT,
  user_agent TEXT,
  event TEXT NOT NULL,                     -- login_ok | login_fail | signup | logout | rate_limit
  meta JSONB
);
CREATE INDEX IF NOT EXISTS idx_auth_audit_ts ON pc.auth_audit(ts DESC);
CREATE INDEX IF NOT EXISTS idx_auth_audit_email ON pc.auth_audit(email, ts DESC);
CREATE INDEX IF NOT EXISTS idx_auth_audit_ip ON pc.auth_audit(ip, ts DESC);
