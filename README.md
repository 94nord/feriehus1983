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

Rollen oprettes og opdateres automatisk ved hver opstart af Strapi (`cms/src/index.ts`).
Ændringer af rollens rettigheder i admin nulstilles derfor ved næste genstart; ret i koden i stedet.

| Område | Bestyrelsen kan |
| --- | --- |
| Nyheder og sider | Oprette, læse, rette, publicere og afpublicere. Ikke slette |
| Links | Oprette, læse, rette og slette (links har ingen kladde) |
| Mediebibliotek | Uploade, rette alt-tekst, hente og kopiere link. Ikke slette |
| Brugere | Invitere og rette brugere, men kun med rollen Bestyrelse og ikke Super Admins |
| Alt andet | Ingen adgang: Settings, roller, API-tokens, webhooks, User-samlingen (slutbrugere) m.m. |

Strapi tillader normalt alle med ret til at oprette brugere at tildele enhver rolle, også
Super Admin. Det er spærret server-side for alle, der ikke selv er Super Admin.

Strapis standardroller Editor og Author slettes ved opstart, så kun Super Admin og
Bestyrelse findes. Har en af dem brugere, springes den over med en advarsel i loggen.

Kun den tekniske ansvarlige er Super Admin. Bestyrelsesmedlemmer inviteres under
**Settings → Users** med rollen "Bestyrelse", én bruger pr. person.

Uploads er begrænset til billeder og PDF, og Strapis telemetri er slået fra.

**Glemt adgangskode** er spærret i Caddy, fordi der ikke er sat e-mail op. Den, der har
glemt sin adgangskode, beder en Super Admin om at sætte en ny under **Settings → Users**.

**Udseende i admin** (`cms/src/admin/app.tsx`): klitrose-farver, logo, danske tekster på
login-siden og ingen Strapi-tutorials. Logoet i `cms/src/admin/extensions/logo.svg` er
midlertidigt og skal skiftes til det rigtige, når det kommer.

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

## Branches og deploy

- Arbejd på `dev` (eller feature-branches) og lav en pull request til `main`.
- **Pull request til `main`:** GitHub Actions bygger images og kører Playwright-testene.
- **Merge/push til `main`:** byg, test, push de testede images til GHCR
  (`ghcr.io/94nord/feriehus1983-cms|web:<commit-SHA>`) og deploy til Hetzner.

Deployet på serveren (`scripts/deploy.sh`) tager backup, sætter `IMAGE_TAG` i `.env`,
henter de nye images, starter dem og ruller tilbage til forrige version, hvis
forsiden ikke svarer. En tilbagerulning gendanner ikke databasen; brug backuppen,
hvis en ændring af datamodellen skal fortrydes.

Anbefalet i GitHub under **Settings → Branches**: beskyt `main`, kræv pull request
og at jobbet "Byg og test" er grønt.

### Opsætning af serveren (én gang)

1. Server med Docker, firewall åben for 22, 80 og 443, kun SSH-nøgler.
2. DNS: `feriehus1983.dk` og `admin.feriehus1983.dk` peger på serveren.
3. Bruger `deploy` i gruppen `docker`, med en SSH-nøgle kun til GitHub Actions.
4. Mappen `/srv/feriehus1983` ejet af `deploy`, med `caddy/` og `scripts/`:
   ```bash
   mkdir -p /srv/feriehus1983/{caddy,scripts,data/db,data/uploads}
   chown -R 1000:1000 /srv/feriehus1983/data/db /srv/feriehus1983/data/uploads
   chmod 700 /srv/feriehus1983/data
   ```
   (Strapi-containeren kører som brugeren `node`, uid 1000)
5. `.env` med produktionsadresserne og egne hemmeligheder (se `.env.example`).
6. Log ind på GHCR som `deploy` med et token, der kun kan læse pakker:
   `docker login ghcr.io -u <github-bruger>`
7. Første deploy: opret admin på `admin.feriehus1983.dk`, lav læsetokenet, sæt
   `STRAPI_TOKEN` i `.env` og kør `docker compose up -d web`.

### Secrets i GitHub

Under **Settings → Environments → production**:

| Secret | Indhold |
| --- | --- |
| `DEPLOY_HOST` | Serverens IP eller hostname |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_SSH_KEY` | Privat nøgle til `deploy`-brugeren |
| `DEPLOY_KNOWN_HOSTS` | Output af `ssh-keyscan <server>` |

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
