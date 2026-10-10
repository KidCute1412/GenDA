# Milestone review verification

The implementation uses real Spring Boot business APIs, JPA/Flyway and PostgreSQL. External AI/storage HTTP fixtures are explicitly test-only; production has no fake fallback.

## Reproduce locally

```powershell
docker compose -f compose.auth-test.yaml -f compose.milestone-test.yaml up --build --wait
node scripts/setup-auth-e2e.mjs
$env:AUTH_TEST_DB_URL='jdbc:postgresql://127.0.0.1:15433/auth_test'
node scripts/api-maven.mjs verify
node --test scripts/milestone-test-provider.test.mjs
$env:NEXT_PUBLIC_API_URL='http://localhost:3002'
$env:API_INTERNAL_URL='http://localhost:3002'
$env:E2E_API_URL='http://localhost:3002'
$env:E2E_WEB_PORT='3010'
corepack pnpm --filter @genda/web build
```

Start `next start --port 3010` from `apps/web` in a separate terminal, then run:

```powershell
corepack pnpm --filter @genda/web exec playwright test milestone-review.spec.ts --workers=1
```

Run frontend builds/dev servers sequentially because they share `.next`. If JUnit cannot clean Windows user temp files in the sandbox, create `apps/api/target/tmp` and pass `'-DargLine=-Djava.io.tmpdir=target/tmp'` to Maven. This changes only test artifacts.

## Evidence and limits

Local results, 2026-10-10:

| Check | Result |
| --- | --- |
| Maven Wrapper `verify`, host JVM, compile target Java 21 | 195 tests passed, 0 skipped; JAR packaged successfully |
| Java 21 Docker verification | Full 193-test suite passed before the final quota/role regression additions; final 10-test milestone integration suite passed separately |
| ArchUnit and rule regression | Passed in the full suite; published interfaces are documented |
| Frontend / generated client | Lint, both typechecks, 41 Vitest tests and production build passed |
| Gemini/Storage HTTP fixture | Node self-check passed; production adapters exercised through fixture HTTP |
| Playwright production acceptance | Two separate-role scenarios passed, including revision history, file upload/download, shared AI reports, feedback, human decisions, funding, completion, invented quotes and provider failure |
| Keyboard and mobile | Native confirmation Escape/focus return passed; 390px viewport had no horizontal overflow; desktop/mobile screenshots inspected |
| Restart persistence | Full workspace response matched the saved E2E snapshot, including project status, milestones, revisions, attachment metadata and AI reports |
| Health/CORS | Frontend → API → PostgreSQL returned 200; exact local origin and credential CORS passed; anonymous workspace request returned 401 |
| Contract / secrets | Live OpenAPI matched snapshot; regenerating client produced identical hash; compiled browser assets contained no Gemini/Storage keys |

The acceptance run used the isolated PostgreSQL `milestone_e2e` schema and API port 3003. A separate frontend copy under ignored `output/milestone-web` used the production build on port 3010 to avoid another task's concurrent `.next` build. The test provider stayed on port 3039. The committed Compose overlay reproduces the same fixture setup on the usual test API port 3002.

E2E creates a separate contributor per scenario, so persisted per-user AI quota is not shared between scenarios. Use a fresh isolated test environment for repeated large runs because registration/login limits remain active; no test bypass is installed in production.

Live Gemini and Supabase Storage require backend credentials and an existing private bucket; these fixture checks do not verify live model access/quota or output quality. Deployment, hot reload, post-project ratings and XP integration are not accepted by these checks.
