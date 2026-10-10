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

Database credentials and host ports are in root .env. Internal database port stays 5432. The unusual host port avoids existing PostgreSQL services on this development machine.

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

For focused architecture checks from the repository root, run `node scripts/api-maven.mjs -Dtest=ArchitectureTest,ArchitectureRulesTest test`. Read [published module interfaces](architecture.md#published-module-interfaces) before adding dependencies; Java `public` does not imply a supported cross-module interface.

If host Java or the Wrapper is unavailable, run tests with the same Maven/Java versions as deployment using Docker Desktop (from the repository root):

```powershell
docker run --rm --mount "type=bind,source=$((Resolve-Path apps/api).Path),target=/app" --mount type=volume,source=genda-maven-cache,target=/root/.m2 --workdir /app maven:3.9.13-eclipse-temurin-21 mvn -B -ntp clean verify
```

This builds only the API and needs no database or email service for the current unit/architecture suite. It writes build output to `apps/api/target` and uses a Maven cache volume, without resetting application data. The existing Compose health/OpenAPI smoke test and generated-contract comparison remain separate checks; run database smoke checks only against an isolated local test database.

If Playwright's browser is missing, install Chromium with `corepack pnpm --filter @genda/web exec playwright install chromium`. The existing `PLAYWRIGHT_CHROME_PATH` override can use installed Chrome when download is unavailable.

The backend serves contributor/SME registration, authentication, the skill/project catalog, contributor profiles, applications, SME project moderation and milestone execution. Registration creates an active account; users sign in with email and password. CV upload, applications, existing XP/tier reads and real workspace delivery/acceptance use the API. Post-project ratings and completion writes to the XP ledger remain separate work; `/workspace/demo` retains browser-ledger behavior. Set a unique AUTH_JWT_SECRET of at least 32 bytes outside local development.

## Milestones and Gemini

Real workspace now reads/writes milestone APIs. `/workspace/demo` remains explicitly demo-only. In local Compose, place storage/AI values in the ignored `apps/api/.env`, which backend already loads; root `.env` remains the local database/port configuration.

Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `DELIVERABLES_BUCKET=milestone-deliverables`; create that private bucket in Supabase. Set `GEMINI_API_KEY` when available; `GEMINI_MODEL` defaults to `gemini-3.5-flash-lite`. Restart/recreate backend after env changes. Never copy hosted JDBC credentials from the template when configuring local Compose.

Without Gemini key, ordinary delivery, change requests and acceptance work. Without storage settings, note/link delivery works and upload reports storage unavailable. There is no production fixture fallback.

See [milestone verification](milestone-review-verification.md) for the isolated fixture E2E commands.
