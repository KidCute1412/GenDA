# Testing Strategy

- JUnit unit tests: domain rules, transitions and use cases.
- PostgreSQL integration: JPA, transactions, constraints and Flyway; do not replace database-specific behavior with an in-memory dialect.
- MockMvc: statuses, validation, errors, authorization.
- ArchUnit: domain purity/dependency direction; add concrete module checks when modules exist.
- OpenAPI regeneration: backend/client contract alignment.
- Existing Vitest/Playwright: frontend demo journeys, not proof of backend authorization/persistence.

Stateful features cover authorized success, unauthenticated/wrong-role/wrong-owner access, invalid transition, validation and relevant database failures. Use isolated deterministic data, never production services.

Run Maven Wrapper `verify` for Java tests/build. Root pnpm tasks bridge Java compile/build to Maven. Backend CI checks Java and Compose API/database startup, then regenerated-contract drift. Frontend CI checks lint, typecheck, Vitest, build and Playwright.

With services running, `node scripts/verify-local.mjs` checks API/frontend/database connectivity, CORS and Flyway history across backend restart. Node is needed for this verification, not for local launch.

Verify frontend HMR and backend rebuild with watch panes active; closing panes leaves containers running and stop/restart retains data. Report unverified Windows Terminal/reload/hosting behavior explicitly.

