-- Переименование claude-specific колонок в agent-агностичные
-- Часть ребрендинга в Autmzr Command — теперь поддерживаем несколько AI-агентов
-- (anthropic-cli, aider, gemini-cli, codex-cli, ...), а не только Anthropic Claude.
--
-- Схема pc.* и существующие индексы / FK не трогаются.
ALTER TABLE pc.devices RENAME COLUMN claude_logged_in TO agent_logged_in;
ALTER TABLE pc.devices RENAME COLUMN claude_installed TO agent_installed;
ALTER TABLE pc.devices RENAME COLUMN claude_version  TO agent_version;
ALTER TABLE pc.devices ADD COLUMN IF NOT EXISTS agent_kind TEXT NOT NULL DEFAULT 'anthropic-cli';
COMMENT ON COLUMN pc.devices.agent_kind IS 'anthropic-cli | aider | gemini-cli | codex-cli | ...';
