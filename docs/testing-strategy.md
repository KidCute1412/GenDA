# Testing Strategy

Use layered pragmatic testing:

- Unit tests: domain rules, state transitions, matching rules, and pure utilities.
- Integration tests: Prisma repositories, transactions, guards, and important API use cases.
- Contract tests: API responses and generated client remain aligned with OpenAPI.
- Playwright: login, SME project creation, admin approval, student application, and acceptance happy paths.

The minimum acceptance matrix for each stateful feature includes authorized success, unauthenticated access, wrong-role access, wrong-owner access, invalid transition, validation failure, and persistence failure where applicable.

Every bug fix adds a regression test at the lowest layer that reproduces it. Tests must use isolated deterministic data and must not depend on production services.

