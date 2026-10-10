# Local development

## Start/stop

Install Docker Desktop with Linux containers and Compose 5.0.2+, plus Windows Terminal. No host Java/Node/Maven/pnpm needed to launch.

```bat
start.bat
```

Creates local `.env` if missing, starts frontend/backend/PostgreSQL, waits for health and opens two terminal panes. First build downloads dependencies; later builds reuse cache.

| Service | Default URL/port |
| --- | --- |
| Frontend | http://localhost:3000 |
| Frontend -> API -> DB check | http://localhost:3000/api/health |
| Backend readiness | http://localhost:3001/api/v1/health |
| OpenAPI | http://localhost:3001/api/v1/openapi |
| PostgreSQL | localhost:15432 |

Database credentials and host ports are in root `.env`; transactional SMTP credentials are in `apps/api/.env`. Internal database port stays 5432. The unusual host port avoids existing PostgreSQL services on this development machine. SMTP secrets must never be committed.

To deliver OTP messages to real user inboxes, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_AUTH`, `SMTP_STARTTLS`, and a provider-verified `AUTH_EMAIL_FROM` in `apps/api/.env`. The checked-in example uses Brevo's relay host, but the values may come from any SMTP provider. `SMTP_PASSWORD` must be the provider's SMTP credential, not an unrelated API key or account password. Restart the backend after changing these values.

One Compose Watch runs in the background. Frontend source sync triggers Next.js HMR; Java/resources/POM changes rebuild and restart backend. Two panes follow only frontend/backend logs. Closing panes leaves services and reload running. Close old panes before launching new ones.

```bat
stop.bat
```

Stops the watcher and services, preserving the named PostgreSQL volume. Do not use `docker compose down -v` unless intentionally deleting data.

## Troubleshooting

```sh
docker compose ps
docker compose logs --tail 100 backend database
docker compose config --quiet
```

Watch diagnostics: `output/genda-compose-watch.log` and `.error.log`. Update Docker Desktop if Watch is unavailable. Change host ports in `.env` if occupied or reserved by Windows. PostgreSQL env credentials only initialize a new volume; changing them does not alter existing database users.

On Linux/CI: copy `.env.example` to `.env`, run `docker compose up --build --wait --wait-timeout 300`, then `docker compose watch --no-up`.

## Checks and API client

Host verification tools are optional; checks require Node/pnpm and Java 21+:
```sh
node scripts/verify-local.mjs
node scripts/export-openapi.mjs
corepack pnpm --filter @genda/api-client generate
corepack pnpm --filter @genda/web lint
corepack pnpm --filter @genda/web typecheck
corepack pnpm --filter @genda/web test
corepack pnpm --filter @genda/web build
corepack pnpm --filter @genda/web test:e2e
```

From `apps/api`, run `mvnw.cmd verify` (Windows) or `sh mvnw verify` (Linux). Commit OpenAPI snapshot/generated types with API changes. Backend lint checks ArchUnit boundaries; compile and tests are Java quality checks.

If Playwright's browser is missing, install Chromium with `corepack pnpm --filter @genda/web exec playwright install chromium`. The existing `PLAYWRIGHT_CHROME_PATH` override can use installed Chrome when download is unavailable.

The backend also serves contributor/SME registration, email OTP verification, authentication, the skill/project catalog, and SME project drafting, submission and admin review (log in as `contact@coffeelab.vn` and `admin@genda.vn`). Docker Compose sends verification mail through the external SMTP account configured in `apps/api/.env` and activates the local-only `demo` profile, which seeds `ACTIVE` login accounts with password `Demo@12345`: SME `contact@coffeelab.vn`, admin `admin@genda.vn`, and one contributor per tier: `letuanloc.2203@hcmus.edu.vn` (Bạc, 14 XP), `tranminhanh@demo.genda.vn` (Đồng, 7 XP, no CV yet) and `phamgiahuy@demo.genda.vn` (Vàng, 33 XP). Their completed-project history comes from `db/demo/contributor-history.sql`; those projects are `COMPLETED` and never appear in the catalog. New registrations remain pending until the OTP delivered to their registered mailbox is confirmed at `/verify-email`. Contributor profile, education, CV upload (PDF validated by the API) and the XP/tier bar use the real API. Applications use the real API too: Phạm Gia Huy has already applied to The Coffee Lab's catalog project, which the demo SME now owns, and Lộc to the Zen Yoga project. The workspace (milestones, deliveries, acceptance, review) remains browser-ledger behavior; when the SME accepts an applicant, the started project and the accepted application are copied into the ledger and opened at `/workspace/{projectId}?ledger=1`. Set a unique `AUTH_JWT_SECRET` of at least 32 bytes outside local development.
