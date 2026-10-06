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

Database credentials and host ports are in root `.env`. Internal database port stays 5432. The unusual host port avoids existing PostgreSQL services on this development machine.

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

The backend also serves the read-only skill and published-project catalog. Docker Compose activates the local-only `demo` profile, whose startup runner applies an idempotent sample-data seed after Flyway; production does not activate this profile. The project list/detail pages use these APIs, while authentication, matching, applications and other workflows remain sample-data/localStorage behavior. See [frontend/backend integration](frontend-backend-integration.md), [architecture](architecture.md) and [deployment](deployment.md).
