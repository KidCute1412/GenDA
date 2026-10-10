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

Contributor-readiness tests cover every missing predicate in `canApplyGeneral`, project browsing while incomplete, authoritative rejection at application submission, and successful submission only with an active account, verified email, complete profile and `READY` CV. CV tests include spoofed MIME/signature, oversize, corrupt/password-protected files, scanner failure/unavailability policy, private download authorization and replacement behavior. `READY` must never be interpreted as verified CV content.

Education tests cover zero, one and multiple entries; create/update/delete ownership; required-field and date/status consistency; `GRADUATED` versus `NOT_COMPLETED` presentation; self-declared labeling; and confirmation that adding/removing all education entries does not change `profileComplete` or `canApplyGeneral`.

Project-complexity tests cover every level at one unit below, exactly at, and one unit above its configured minimum; strict ordering of the three minimums; server-side revalidation on both submit-for-review and publish; and rejection of client-tampered values. Moderation tests cover a scope that matches its declared level and an obviously under-classified scope returned to `DRAFT` with reviewer, mandatory reason, timestamp, and suggested complexity. They also confirm that the admin cannot silently mutate SME-owned scope, complexity, or budget.

Run Maven Wrapper `verify` for Java tests/build. Root pnpm tasks bridge Java compile/build to Maven. Backend CI checks Java and Compose API/database startup, then regenerated-contract drift. Frontend CI checks lint, typecheck, Vitest and build; Playwright remains available for manual/local E2E runs.

For architecture work, run `node scripts/api-maven.mjs -Dtest=ArchitectureTest,ArchitectureRulesTest test` from the repository root, then the full Maven `verify`. Configuration regression tests check the shared UTC clock and exact CORS policy. Existing standalone MockMvc tests do not exercise the real security filter chain, and the Compose smoke test does not replace PostgreSQL persistence/transaction integration tests; that coverage remains separate work.

With services running, `node scripts/verify-local.mjs` checks API/frontend/database connectivity, CORS and Flyway history across backend restart. Node is needed for this verification, not for local launch.

Verify frontend HMR and backend rebuild with watch panes active; closing panes leaves containers running and stop/restart retains data. Report unverified Windows Terminal/reload/hosting behavior explicitly.

Backend CI installs Docker Compose v5.0.2 explicitly so the full Compose configuration, including frontend Watch initial_sync, validates independently of the runner image.

Auth E2E runs against `compose.auth-test.yaml`, an isolated PostgreSQL database. Runtime auth has no mock session, seed login accounts or test bypass. Test fixtures are provisioned explicitly by `scripts/setup-auth-e2e.mjs`. PostgreSQL migration tests use `AUTH_TEST_DB_URL` and a unique test schema.
