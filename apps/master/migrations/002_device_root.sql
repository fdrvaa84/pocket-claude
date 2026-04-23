-- Корневая директория устройства — стартовая точка для FolderPicker / DeviceBrowser
ALTER TABLE pc.devices ADD COLUMN IF NOT EXISTS root_path TEXT;
