#!/usr/bin/env bash
# Opretter .env ud fra .env.example med tilfældige Strapi-hemmeligheder.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  echo ".env findes allerede – sletter ikke noget." >&2
  exit 1
fi

hemmelighed() { openssl rand -base64 32 | tr -d '\n'; }

sed \
  -e "s|^APP_KEYS=.*|APP_KEYS=$(hemmelighed),$(hemmelighed)|" \
  -e "s|^API_TOKEN_SALT=.*|API_TOKEN_SALT=$(hemmelighed)|" \
  -e "s|^ADMIN_JWT_SECRET=.*|ADMIN_JWT_SECRET=$(hemmelighed)|" \
  -e "s|^TRANSFER_TOKEN_SALT=.*|TRANSFER_TOKEN_SALT=$(hemmelighed)|" \
  -e "s|^JWT_SECRET=.*|JWT_SECRET=$(hemmelighed)|" \
  -e "s|^ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$(hemmelighed)|" \
  .env.example > .env
chmod 600 .env
echo ".env oprettet."
