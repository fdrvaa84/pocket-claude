-- Device intent — явная роль устройства, заданная пользователем.
-- Раньше UI полагался только на эвристику claude_logged_in; теперь пользователь
-- сам указывает при подключении, что это за устройство.
--
-- auto     — решаем по claude_logged_in (обратная совместимость: все старые девайсы)
-- claude   — пользователь сказал «Claude запускается здесь»; логин обязателен
-- fs-only  — пользователь сказал «только файлы»; Claude никогда здесь не запускаем,
--            даже если CLI установлен. Proxy-mode включается автоматически.

ALTER TABLE pc.devices
  ADD COLUMN IF NOT EXISTS intent text NOT NULL DEFAULT 'auto';

ALTER TABLE pc.devices
  ADD CONSTRAINT devices_intent_chk CHECK (intent IN ('auto', 'claude', 'fs-only'));

CREATE INDEX IF NOT EXISTS idx_devices_intent ON pc.devices (intent);
