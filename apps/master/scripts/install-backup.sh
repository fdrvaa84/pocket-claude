#!/usr/bin/env bash
# Установка systemd-таймера для pocket-claude бэкапов.
# Запускать на проде: bash apps/master/scripts/install-backup.sh
set -euo pipefail

REPO=/opt/pocket-claude
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

cp "$SCRIPTS/pocket-claude-backup.service" /etc/systemd/system/
cp "$SCRIPTS/pocket-claude-backup.timer"   /etc/systemd/system/

mkdir -p /var/backups/pocket-claude
touch /var/log/pocket-claude-backup.log

systemctl daemon-reload
systemctl enable --now pocket-claude-backup.timer

echo "✓ установлено"
echo "Проверь статус: systemctl status pocket-claude-backup.timer"
echo "Запустить вручную: systemctl start pocket-claude-backup.service && tail -50 /var/log/pocket-claude-backup.log"
