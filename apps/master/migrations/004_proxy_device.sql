-- Proxy-device (RFS MCP) support.
-- Idea: project's files live on one device (fs-device), but claude CLI runs on another
-- (claude-device, with claude_logged_in = true). When claude wants to read/write/exec,
-- it calls our rfs-mcp server, which round-trips to master → fs-device via WebSocket.

-- claude_device_id is optional: if NULL, device_id is used both for files and for claude (current behavior).
ALTER TABLE pc.projects
  ADD COLUMN IF NOT EXISTS claude_device_id uuid REFERENCES pc.devices(id) ON DELETE SET NULL;

-- Ephemeral tokens handed to rfs-mcp instances so they can call master's API.
-- Scoped to (user, project, fs-device). TTL ~ 2h (refreshed on each claude invocation).
CREATE TABLE IF NOT EXISTS pc.rfs_tokens (
  token        text PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES pc.users(id)    ON DELETE CASCADE,
  project_id   uuid NOT NULL REFERENCES pc.projects(id) ON DELETE CASCADE,
  fs_device_id uuid NOT NULL REFERENCES pc.devices(id)  ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT NOW(),
  expires_at   timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rfs_tokens_expires ON pc.rfs_tokens (expires_at);
CREATE INDEX IF NOT EXISTS idx_rfs_tokens_project ON pc.rfs_tokens (project_id);
