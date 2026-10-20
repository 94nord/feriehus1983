#!/usr/bin/env bash
# Deployer en ny version på serveren. Kaldes af GitHub Actions over SSH:
#   scripts/deploy.sh <image-tag>
# Tager backup, henter de testede images, starter dem og ruller tilbage,
# hvis siden ikke svarer bagefter.
set -euo pipefail
cd "$(dirname "$0")/.."

NY_TAG="${1:?Angiv image-tag (commit-SHA)}"
FORRIGE_TAG="$(sed -n 's/^IMAGE_TAG=//p' .env)"

saet_tag() {
  if grep -q '^IMAGE_TAG=' .env; then
    sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=$1/" .env
  else
    echo "IMAGE_TAG=$1" >> .env
  fi
}

start() {
  docker compose pull cms web
  docker compose up -d --no-build --wait
}

site_svarer() {
  local adresse
  adresse="$(sed -n 's/^SITE_ADDRESS=//p' .env)"
  for _ in $(seq 1 30); do
    if curl -fsS -o /dev/null "https://${adresse}/"; then
      return 0
    fi
    sleep 2
  done
  return 1
}

# Backup før deploy: Strapi ændrer databasen ved opstart, hvis datamodellen er ændret
if [ -f .env.backup ] && [ -f data/db/data.db ]; then
  scripts/backup.sh
fi

echo "Deployer ${NY_TAG} (forrige: ${FORRIGE_TAG:-ingen})"
saet_tag "$NY_TAG"
start

if site_svarer; then
  docker image prune -f > /dev/null
  echo "Deploy af ${NY_TAG} gennemført"
  exit 0
fi

echo "Siden svarer ikke efter deploy" >&2
if [ -n "$FORRIGE_TAG" ]; then
  echo "Ruller tilbage til ${FORRIGE_TAG}" >&2
  saet_tag "$FORRIGE_TAG"
  start
fi
exit 1
