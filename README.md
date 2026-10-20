# Feriehusforeningen af 1983 – hjemmeside

Nyheder og nyttige links. Bestyrelsen redigerer indhold i Strapi; Astro viser siden.

| Del | Mappe | Kører på |
| --- | --- | --- |
| CMS (Strapi 5, SQLite) | `cms/` | `cms:1337` internt |
| Frontend (Astro, SSR) | `web/` | `web:4321` internt |
| Reverse proxy (Caddy) | `caddy/` | port 80/443 |

Adresser:

- Hjemmeside: `feriehus1983.dk` (lokalt `http://localhost`)
- Admin: `admin.feriehus1983.dk` (lokalt `http://admin.localhost`)
- Billeder: `/uploads/...` på hjemmesidens domæne, sendes videre til Strapi

Data ligger i `data/` (ikke i Git):

```
data/
├── db/        SQLite-database (+ -wal/-shm)
├── uploads/   billeder fra mediebiblioteket
└── backup/    midlertidig databasekopi under backup
```

## Kør lokalt med Docker

```bash
./scripts/generate-env.sh          # opretter .env med tilfældige hemmeligheder
mkdir -p data/db data/uploads
docker compose up -d --build
```

Første gang:

1. Gå til `http://admin.localhost` og opret den første administrator.
2. **Settings → API Tokens → Create new API Token**: navn "Frontend", type **Read-only**, varighed **Unlimited**.
3. Sæt tokenet i `.env` som `STRAPI_TOKEN=...` og kør `docker compose up -d web`.
4. Opret nyheder og links under **Content Manager**. Siden er på `http://localhost`.

## Rollen "Bestyrelse"

Opret i admin under **Settings → Administration Panel → Roles**:

- Content Manager: **Nyhed** og **Side** (opret, læs, opdater, slet, publicer) og **Link** (opret, læs, opdater, slet)
- Media Library: adgang til at uploade og vælge filer
- Ingen adgang til Settings, Content-Type Builder eller andre plugins

Inviter bestyrelsesmedlemmer under **Settings → Users** med rollen "Bestyrelse".

## Ændre datamodellen

Content-Type Builder virker kun i udviklingstilstand og er slået fra i Docker.

```bash
cd cms
npm run develop                     # bruger cms/.env og cms/.tmp/data.db
```

Ændringer gemmes som filer i `cms/src/api/`. Byg derefter imaget igen:
`docker compose up -d --build cms`.

## Udvikle frontenden uden Docker

Med stakken kørende:

```bash
cd web
STRAPI_URL=http://admin.localhost STRAPI_TOKEN=<token> MEDIA_URL=http://localhost npm run dev
```

## Tests

Playwright-tests af hjemmesiden ligger i `tests/`. De starter en separat teststak
(`feriehus1983-test`) på port 8080 med egne data i `data-test/`, så udviklingsdata ikke røres.

```bash
cd tests
npm install
npx playwright install chromium
npm test
```

Testene opretter selv en admin, et læsetoken og testindhold, og rydder op bagefter.
`KEEP_STACK=1 npm test` lader teststakken køre (`http://localhost:8080`).
Rapporten ses med `npm run report`.

De dækker nyhedsliste, bladring, nyhedssider, billeder, faste sider, links, kladder,
404, grundlæggende tilgængelighed på desktop og mobil, og at Caddy spærrer
slutbruger-login. Strapis admin-brugerflade testes ikke.

## Deploy til Hetzner

1. Server med Docker, firewall åben for 22, 80 og 443, kun SSH-nøgler.
2. DNS: `feriehus1983.dk` og `admin.feriehus1983.dk` peger på serveren.
3. Projektet i `/srv/feriehus1983`, `.env` med produktionsadresserne (se `.env.example`).
4. `mkdir -p data/db data/uploads && chown -R 1000:1000 data/db data/uploads && chmod 700 data && docker compose up -d --build`
   (Strapi-containeren kører som brugeren `node`, uid 1000)
5. Caddy henter certifikater automatisk.

Strapi-admin kræver ca. 2 GB hukommelse at bygge. Byg derfor imaget lokalt eller i CI på små servere (eller tilføj swap). Fra en Mac til en x86-server: `docker buildx build --platform linux/amd64`.

## Backup

`scripts/backup.sh` tager en konsistent kopi af SQLite og sender database og billeder til en Hetzner Storage Box med restic (7 daglige, 4 ugentlige, 3 månedlige).

Opsætning på serveren:

1. Opret en underkonto på Storage Boxen med kun SSH-adgang til mappen `feriehus1983/hjemmeside`.
2. `~/.ssh/config`:
   ```
   Host storagebox-feriehus
     HostName <bruger>.your-storagebox.de
     User <underkonto>
     Port 23
   ```
3. `.env.backup` i projektmappen:
   ```
   RESTIC_REPOSITORY=sftp:storagebox-feriehus:/restic
   RESTIC_PASSWORD_FILE=/root/.restic-feriehus1983
   HEALTHCHECK_URL=
   ```
4. `restic init`, gem adgangskoden uden for serveren.
5. Cron: `15 3 * * * /srv/feriehus1983/scripts/backup.sh`

Gendannelse:

```bash
docker compose stop cms
restic restore latest --target /tmp/gendan
rm -f data/db/data.db-wal data/db/data.db-shm
cp /tmp/gendan/srv/feriehus1983/data/backup/data.db data/db/data.db
rsync -a /tmp/gendan/srv/feriehus1983/data/uploads/ data/uploads/
docker compose start cms
```

Test gendannelsen mindst én gang.
