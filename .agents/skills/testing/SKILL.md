---
name: testing
description: Choose pragmatic JUnit, PostgreSQL, MockMvc, ArchUnit, contract, Vitest and Playwright tests for SkillBridge.
---

Read `docs/testing-strategy.md`. Unit tests cover rules, PostgreSQL integration covers persistence/transactions/migrations, MockMvc covers HTTP/validation/auth, ArchUnit covers dependencies, generated-contract checks cover client alignment and Vitest/Playwright cover UI. Cover positive/negative authorization/transitions when implemented. Use isolated deterministic data, no production services. Run Maven Wrapper verify and frontend checks; use `scripts/verify-local.mjs` for Compose connectivity/Flyway restart persistence. Report unverified reload, terminal or hosting behavior.

