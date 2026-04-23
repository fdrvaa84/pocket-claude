-- Расширение статуса Claude на устройстве.
-- Раньше был только claude_logged_in (bool), что не различало
-- "не установлен" vs "установлен, но не залогинен". Теперь хранимся явно.

ALTER TABLE pc.devices
  ADD COLUMN IF NOT EXISTS claude_installed boolean,
  ADD COLUMN IF NOT EXISTS claude_version   text;
