#!/usr/bin/env bash
# Creates .env from .env.example with random Strapi secrets.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  echo ".env already exists; nothing is overwritten." >&2
  exit 1
fi

secret() { openssl rand -base64 32 | tr -d '\n'; }

sed \
  -e "s|^APP_KEYS=.*|APP_KEYS=$(secret),$(secret)|" \
  -e "s|^API_TOKEN_SALT=.*|API_TOKEN_SALT=$(secret)|" \
  -e "s|^ADMIN_JWT_SECRET=.*|ADMIN_JWT_SECRET=$(secret)|" \
  -e "s|^TRANSFER_TOKEN_SALT=.*|TRANSFER_TOKEN_SALT=$(secret)|" \
  -e "s|^JWT_SECRET=.*|JWT_SECRET=$(secret)|" \
  -e "s|^ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$(secret)|" \
  -e "s|^PREVIEW_SECRET=.*|PREVIEW_SECRET=$(openssl rand -hex 32)|" \
  .env.example > .env
chmod 600 .env
echo ".env created."
