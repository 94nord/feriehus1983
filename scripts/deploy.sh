#!/usr/bin/env bash
# Deploys a new version on the server. Called by GitHub Actions over SSH:
#   scripts/deploy.sh <image-tag>
# Takes a backup, pulls the tested images, starts them and rolls back
# if the site does not respond afterwards.
set -euo pipefail
cd "$(dirname "$0")/.."

NEW_TAG="${1:?Specify the image tag (commit SHA)}"
PREVIOUS_TAG="$(sed -n 's/^IMAGE_TAG=//p' .env)"

set_tag() {
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

site_responds() {
  local address
  address="$(sed -n 's/^SITE_ADDRESS=//p' .env)"
  for _ in $(seq 1 30); do
    if curl -fsS -o /dev/null "https://${address}/"; then
      return 0
    fi
    sleep 2
  done
  return 1
}

# Backup before deploy: Strapi changes the database on startup if the data model has changed
if [ -f .env.backup ] && [ -f data/db/data.db ]; then
  scripts/backup.sh
fi

echo "Deploying ${NEW_TAG} (previous: ${PREVIOUS_TAG:-none})"
set_tag "$NEW_TAG"
start

if site_responds; then
  docker image prune -f > /dev/null
  echo "Deploy of ${NEW_TAG} completed"
  exit 0
fi

echo "The site does not respond after deploy" >&2
if [ -n "$PREVIOUS_TAG" ]; then
  echo "Rolling back to ${PREVIOUS_TAG}" >&2
  set_tag "$PREVIOUS_TAG"
  start
fi
exit 1
