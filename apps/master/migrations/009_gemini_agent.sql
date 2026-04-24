-- Multi-agent support (phase 1): добавляем Gemini CLI рядом с Claude.
-- Пока без полной abstraction (без таблицы device_agents) — тупо колонки,
-- как у Claude. Если добавится 3-й/4-й провайдер, эволюционируем в таблицу.
--
-- preferred_agent — какой провайдер использовать когда юзер пишет в чат.
-- Default 'claude-code' для обратной совместимости с уже подключёнными
-- девайсами.

ALTER TABLE pc.devices
  ADD COLUMN IF NOT EXISTS gemini_installed BOOLEAN,
  ADD COLUMN IF NOT EXISTS gemini_version   TEXT,
  ADD COLUMN IF NOT EXISTS gemini_logged_in BOOLEAN,
  ADD COLUMN IF NOT EXISTS preferred_agent  TEXT NOT NULL DEFAULT 'claude-code';

COMMENT ON COLUMN pc.devices.preferred_agent IS 'claude-code | gemini-cli | aider — какой CLI агент использовать по умолчанию на этом девайсе';
