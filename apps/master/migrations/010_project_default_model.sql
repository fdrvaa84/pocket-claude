-- Per-project default model для осознанного выбора «тяжёлая/лёгкая» модель
-- под задачу. Влияет только на НОВЫЕ чаты в проекте: берётся как начальное
-- значение sessions.model. Уже идущие чаты не трогаем.
--
-- Fallback-цепочка (в api/chat/route.ts):
--   session.model  (если явно задан — override в пилюле composer)
--   project.default_model  (дефолт проекта)
--   HARDCODED[provider]   ('sonnet' для claude-code, 'gemini-2.5-pro' для gemini-cli)
--
-- NULL = провайдерский default. Это корректно для legacy-строк.

ALTER TABLE pc.projects
  ADD COLUMN IF NOT EXISTS default_model TEXT;

COMMENT ON COLUMN pc.projects.default_model IS
  'Default Claude/Gemini SKU для новых чатов. NULL = hardcoded per-provider default.';
