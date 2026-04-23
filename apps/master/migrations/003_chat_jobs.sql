-- Persistent storage for chat jobs.
-- Цель: при рестарте мастера или дисконнекте агента ответ Claude всё равно
-- сохраняется при следующем поступлении событий.

CREATE TABLE IF NOT EXISTS pc.chat_jobs (
  id UUID PRIMARY KEY,                            -- ClaudeRequest.id (тот же что correlation_id)
  user_id UUID NOT NULL REFERENCES pc.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES pc.sessions(id) ON DELETE CASCADE,
  device_id UUID REFERENCES pc.devices(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'running',          -- running | done | error | abandoned
  prompt TEXT NOT NULL,
  model TEXT,
  accumulated_text TEXT NOT NULL DEFAULT '',
  tool_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  claude_session_id TEXT,
  error TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_chat_jobs_session ON pc.chat_jobs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_jobs_running ON pc.chat_jobs(status) WHERE status = 'running';
