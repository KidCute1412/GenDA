---
name: api-contract
description: Define SkillBridge Spring Boot REST contracts and generate TypeScript frontend clients from OpenAPI.
---

Read `docs/api-conventions.md`. Define Java DTOs, Jakarta validation and controller metadata; springdoc emits `/api/v1/openapi` locally. Export with `node scripts/export-openapi.mjs`, regenerate with `corepack pnpm --filter @genda/api-client generate`, and commit snapshot/types. Specify status/error codes and authorization. Never expose JPA entities. Keep `/api/v1` and existing semantics unless a breaking change is explicitly chosen. Add HTTP/contract tests; check regeneration produces no diff.

