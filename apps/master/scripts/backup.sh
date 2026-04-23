#!/usr/bin/env bash
# pocket-claude DB backup script.
# Запускается systemd-таймером (см. pocket-claude-backup.timer).
#
# Конфиг через env:
#   BACKUP_DIR        — куда складывать (default: /var/backups/pocket-claude)
#   DATABASE_URL      — строка подключения (postgresql://...)
#   RETENTION_DAILY   — сколько дневных хранить (default: 14)
#   RETENTION_WEEKLY  — сколько недельных (default: 8)
#
# Что делает:
#   1. pg_dump в .sql.gz с timestamp
#   2. Удаляет старые бэкапы по политике retention
#   3. Логирует в /var/log/pocket-claude-backup.log

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/pocket-claude}"
DATABASE_URL="${DATABASE_URL:-}"
RETENTION_DAILY="${RETENTION_DAILY:-14}"
RETENTION_WEEKLY="${RETENTION_WEEKLY:-8}"
LOG="${BACKUP_LOG:-/var/log/pocket-claude-backup.log}"

mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR/daily"
mkdir -p "$BACKUP_DIR/weekly"
touch "$LOG" || true

ts() { date -u '+%Y-%m-%dT%H:%M:%SZ'; }
log() { echo "$(ts) $*" | tee -a "$LOG" >&2; }

if [ -z "$DATABASE_URL" ]; then
  log "ERROR: DATABASE_URL not set"
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  log "ERROR: pg_dump not found. apt-get install postgresql-client"
  exit 1
fi

DATE=$(date '+%Y%m%d-%H%M%S')
DAY_OF_WEEK=$(date '+%u')   # 1=Monday ... 7=Sunday
DAILY_FILE="$BACKUP_DIR/daily/pocket-claude-$DATE.sql.gz"

log "start backup → $DAILY_FILE"

# pg_dump с custom-форматом даёт меньший размер, но мы используем plain+gz —
# проще восстанавливать (gunzip + psql).
if pg_dump --no-owner --no-acl --clean --if-exists "$DATABASE_URL" 2>>"$LOG" | gzip -9 > "$DAILY_FILE.tmp"; then
  mv "$DAILY_FILE.tmp" "$DAILY_FILE"
  SIZE=$(du -h "$DAILY_FILE" | cut -f1)
  log "daily backup ok ($SIZE)"
else
  rm -f "$DAILY_FILE.tmp"
  log "ERROR: pg_dump failed"
  exit 1
fi

# По воскресеньям — копия в weekly
if [ "$DAY_OF_WEEK" = "7" ]; then
  WEEKLY_FILE="$BACKUP_DIR/weekly/pocket-claude-$DATE.sql.gz"
  cp "$DAILY_FILE" "$WEEKLY_FILE"
  log "weekly snapshot ok → $WEEKLY_FILE"
fi

# Retention: удалить старые
find "$BACKUP_DIR/daily"  -name 'pocket-claude-*.sql.gz' -type f -mtime +${RETENTION_DAILY} -delete -print | while read f; do
  log "purged daily: $(basename $f)"
done
find "$BACKUP_DIR/weekly" -name 'pocket-claude-*.sql.gz' -type f -mtime +$((RETENTION_WEEKLY * 7)) -delete -print | while read f; do
  log "purged weekly: $(basename $f)"
done

log "done. total in $BACKUP_DIR: $(find "$BACKUP_DIR" -name '*.sql.gz' | wc -l) backups"
