#!/usr/bin/env bash
# Natlig backup af database og billeder til Storage Box med restic.
# Køres fra cron på serveren, fx:  15 3 * * * /srv/feriehus1983/scripts/backup.sh
#
# Kræver .env.backup i projektmappen med:
#   RESTIC_REPOSITORY=sftp:storagebox-feriehus:/restic
#   RESTIC_PASSWORD_FILE=/root/.restic-feriehus1983
#   HEALTHCHECK_URL=          (valgfri, kaldes ved succes)
set -euo pipefail
cd "$(dirname "$0")/.."

set -a
source .env.backup
set +a

mkdir -p data/backup

# Konsistent kopi af SQLite, mens Strapi kører
docker compose exec -T cms node -e \
  "require('better-sqlite3')('data/db/data.db', { readonly: true }).backup('data/db/backup.db').then(() => process.exit(0))"
mv data/db/backup.db data/backup/data.db

restic backup --tag feriehus1983 data/backup data/uploads
restic forget --prune --keep-daily 7 --keep-weekly 4 --keep-monthly 3

rm -f data/backup/data.db

if [ -n "${HEALTHCHECK_URL:-}" ]; then
  curl -fsS -m 10 --retry 3 "$HEALTHCHECK_URL" > /dev/null
fi
