# Testing Strategy

- JUnit unit tests: domain rules, transitions and use cases.
- PostgreSQL integration: JPA, transactions, constraints and Flyway; do not replace database-specific behavior with an in-memory dialect.
- MockMvc: statuses, validation, errors, authorization.
- ArchUnit: domain purity/dependency direction; add concrete module checks when modules exist.
- OpenAPI regeneration: backend/client contract alignment.
- Existing Vitest/Playwright: frontend demo journeys, not proof of backend authorization/persistence.

Stateful features cover authorized success, unauthenticated/wrong-role/wrong-owner access, invalid transition, validation and relevant database failures. Use isolated deterministic data, never production services.

Email-verification tests cover correct, incorrect, expired, consumed and superseded OTPs; maximum attempts; resend cooldown/rate limits; hash-only persistence; no session before verification; and the independent SME-approval gate. Avoid asserting or logging a real OTP outside dedicated test fixtures.

SME-verification tests cover required business identity, tax-code format/uniqueness and website fallback; `PENDING → VERIFIED` and `PENDING → REJECTED`; mandatory rejection reason; reviewer/timestamp audit; no full session or project creation while pending/rejected; successful login only after both email and business verification; and confirmation that SME approval never publishes a project automatically.

Contributor-readiness tests cover every missing predicate in `canApplyGeneral`, project browsing while incomplete, authoritative rejection at application submission, and successful submission only with an active account, verified email, complete profile and `READY` CV. CV tests include spoofed MIME/signature, oversize, corrupt/password-protected files, scanner failure/unavailability policy, private download authorization and replacement behavior. `READY` must never be interpreted as verified CV content.

Education tests cover zero, one and multiple entries; create/update/delete ownership; required-field and date/status consistency; `GRADUATED` versus `NOT_COMPLETED` presentation; self-declared labeling; and confirmation that adding/removing all education entries does not change `profileComplete` or `canApplyGeneral`.

Project-complexity tests cover every level at one unit below, exactly at, and one unit above its configured minimum; strict ordering of the three minimums; server-side revalidation on both submit-for-review and publish; and rejection of client-tampered values. Moderation tests cover a scope that matches its declared level and an obviously under-classified scope returned to `DRAFT` with reviewer, mandatory reason, timestamp, and suggested complexity. They also confirm that the admin cannot silently mutate SME-owned scope, complexity, or budget.

Run Maven Wrapper `verify` for Java tests/build. Root pnpm tasks bridge Java compile/build to Maven. Backend CI checks Java and Compose API/database startup, then regenerated-contract drift. Frontend CI checks lint, typecheck, Vitest, build and Playwright.

With services running, `node scripts/verify-local.mjs` checks API/frontend/database connectivity, CORS and Flyway history across backend restart. Node is needed for this verification, not for local launch.

Verify frontend HMR and backend rebuild with watch panes active; closing panes leaves containers running and stop/restart retains data. Report unverified Windows Terminal/reload/hosting behavior explicitly.

Backend CI installs Docker Compose v5.0.2 explicitly so the full Compose configuration, including frontend Watch initial_sync, validates independently of the runner image.
