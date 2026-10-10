# Testing Strategy

- JUnit unit tests: domain rules, transitions and use cases.
- PostgreSQL integration: JPA, transactions, constraints and Flyway; do not replace database-specific behavior with an in-memory dialect.
- MockMvc: statuses, validation, errors, authorization.
- ArchUnit: domain purity, layer placement/direction, explicit published cross-module interfaces, platform independence and module cycles. `ArchitectureRulesTest` uses deliberately invalid test-only modules to prove that domain framework/JDBC imports, private repository access, API-to-infrastructure access and cycles are rejected; these fixtures are excluded from the production architecture scan.
- OpenAPI regeneration: backend/client contract alignment.
- Existing Vitest/Playwright: frontend demo journeys, not proof of backend authorization/persistence.

Stateful features cover authorized success, unauthenticated/wrong-role/wrong-owner access, invalid transition, validation and relevant database failures. Use isolated deterministic data, never production services.

Registration tests assert immediate activation, rate limits and no session issuance. Persistence integration tests cover the V15 migration that activates legacy pending accounts, preserves disabled accounts and removes OTP tables.

Auth tests cover required self-declared SME identity, disabled/pending sign-in denial, active verified SME sign-in without business approval, BCrypt byte boundaries, rate-limit windows/capacity, CSRF, refresh rotation and logout. Business-review tests are outside MVP.

Contributor-readiness tests cover every missing predicate in `canApplyGeneral`, project browsing while incomplete, authoritative rejection at application submission, and successful submission only with an active account, complete profile and `READY` CV. Email OTP is deferred from MVP. CV tests include spoofed MIME/signature, oversize, corrupt/password-protected files, scanner failure/unavailability policy, private download authorization and replacement behavior. `READY` must never be interpreted as verified CV content.

Education tests cover zero, one and multiple entries; create/update/delete ownership; required-field and date/status consistency; `GRADUATED` versus `NOT_COMPLETED` presentation; self-declared labeling; and confirmation that adding/removing all education entries does not change `profileComplete` or `canApplyGeneral`.

Project-complexity tests cover both inclusive boundaries and amounts outside each level's minimum/maximum; server-side revalidation on both submit-for-review and publish; and rejection of client-tampered values. Moderation tests cover a scope that matches its declared level and an under-classified scope returned to `DRAFT` with reviewer, mandatory reason, timestamp, and suggested complexity. They also confirm that the admin cannot silently mutate SME-owned scope, complexity, or budget.

Flow 2 uses `ProjectLifecycleIntegrationTest` with `AUTH_TEST_DB_URL` and an isolated schema for draft collection replacement, return/resubmission/publication, audit rollback, concurrent decisions, expired deadlines and the production security filter chain. `project-moderation.spec.ts` exercises the real SME/admin/contributor UI against `compose.auth-test.yaml`; no business API mocks. Draft deletion is deferred from MVP. Restart acceptance must read actual project and audit rows again, not only check Flyway history.

To reproduce flow 2 locally on Windows, start `docker compose -f compose.auth-test.yaml up -d --build --wait`. Provision the three fixture accounts once with `node scripts/setup-auth-e2e.mjs` when that isolated database has no fixtures; do not reset the development database. For PostgreSQL tests, set `AUTH_TEST_DB_URL=jdbc:postgresql://localhost:15433/auth_test` and run `mvnw.cmd verify` from `apps/api`. If Windows denies JUnit's temporary directory, add `-DargLine=-Djava.io.tmpdir=target`.

For E2E, set `NEXT_PUBLIC_API_URL` and `API_INTERNAL_URL` to `http://localhost:3002`, `E2E_API_URL` to the same URL, and `E2E_WEB_PORT=3010`. Set `PLAYWRIGHT_CHROME_PATH` to an installed Chrome executable if bundled Chromium is unavailable. Run `corepack pnpm --filter @genda/web exec playwright test project-moderation.spec.ts --workers=1`. For production acceptance, build the frontend, run `next start --port 3010` in a separate terminal, then run that test against the existing server. Run builds and dev servers sequentially because they share `.next`.

Run Maven Wrapper `verify` for Java tests/build. Root pnpm tasks bridge Java compile/build to Maven. Backend CI checks Java and Compose API/database startup, then regenerated-contract drift. Frontend CI checks lint, typecheck, Vitest and build; Playwright remains available for manual/local E2E runs.

For architecture work, run `node scripts/api-maven.mjs -Dtest=ArchitectureTest,ArchitectureRulesTest test` from the repository root, then the full Maven `verify`. Configuration regression tests check the shared UTC clock and exact CORS policy. Existing standalone MockMvc tests do not exercise the real security filter chain, and the Compose smoke test does not replace PostgreSQL persistence/transaction integration tests; that coverage remains separate work.

With services running, `node scripts/verify-local.mjs` checks API/frontend/database connectivity, CORS and Flyway history across backend restart. Node is needed for this verification, not for local launch.

Verify frontend HMR and backend rebuild with watch panes active; closing panes leaves containers running and stop/restart retains data. Report unverified Windows Terminal/reload/hosting behavior explicitly.

Backend CI installs Docker Compose v5.0.2 explicitly so the full Compose configuration, including frontend Watch initial_sync, validates independently of the runner image.

Auth E2E runs against `compose.auth-test.yaml`, an isolated PostgreSQL database. Runtime auth has no mock session, seed login accounts or test bypass. Test fixtures are provisioned explicitly by `scripts/setup-auth-e2e.mjs`. PostgreSQL migration tests use `AUTH_TEST_DB_URL` and a unique test schema.

## Milestone and AI acceptance

Run `MilestoneLifecycleIntegrationTest` with AUTH_TEST_DB_URL for real Flyway/JPA, assignment initialization, revisions, ownership/CSRF, concurrent decisions, completion and audit rollback. Domain tests verify transitions and quote/criterion checks; parser tests cover UTF-8, real PDF pages, scans, invalid/encrypted files. Gemini adapter tests use a local HTTP server and verify structured output plus header-only secrets.

The `compose.milestone-test.yaml` overlay adds local HTTP fixtures to `compose.auth-test.yaml`; production adapters still perform real HTTP. Run `node --test scripts/milestone-test-provider.test.mjs` to check fixture behavior. Never activate fixture credentials/endpoints outside test.

`milestone-review.spec.ts` uses separate SME/contributor browser contexts, real business APIs/PostgreSQL and frontend rendering. It covers upload/download, shared AI evidence, retained revisions, request changes, resubmit, funding/completion, fabricated-quote rejection and provider failure without blocking manual review. See [verification instructions](milestone-review-verification.md).
