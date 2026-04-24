#!/usr/bin/env bash
# Установка systemd-таймера для autmzr-command бэкапов.
# Запускать на проде: bash apps/master/scripts/install-backup.sh
set -euo pipefail

REPO=/opt/autmzr-command
SCRIPTS=$REPO/apps/master/scripts

if [ "$EUID" -ne 0 ]; then
  echo "ERROR: запускать от root"; exit 1
fi

if [ ! -f "$REPO/.env" ]; then
  echo "ERROR: $REPO/.env не найден (нужен DATABASE_URL внутри)"; exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "Устанавливаю postgresql-client..."
  apt-get update && apt-get install -y postgresql-client
fi

chmod +x "$SCRIPTS/backup.sh"

# Миграция со старых имён (pocket-claude-backup → autmzr-command-backup), если есть.
if [ -f /etc/systemd/system/pocket-claude-backup.timer ]; then
  systemctl disable --now pocket-claude-backup.timer 2>/dev/null || true
  rm -f /etc/systemd/system/pocket-claude-backup.timer
  rm -f /etc/systemd/system/pocket-claude-backup.service
fi

cp "$SCRIPTS/autmzr-command-backup.service" /etc/systemd/system/
cp "$SCRIPTS/autmzr-command-backup.timer"   /etc/systemd/system/

mkdir -p /var/backups/autmzr-command
touch /var/log/autmzr-command-backup.log

systemctl daemon-reload
systemctl enable --now autmzr-command-backup.timer

echo "✓ установлено"
echo "Проверь статус: systemctl status autmzr-command-backup.timer"
echo "Запустить вручную: systemctl start autmzr-command-backup.service && tail -50 /var/log/autmzr-command-backup.log"
