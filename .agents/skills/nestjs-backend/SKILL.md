---
name: nestjs-backend
description: Implement SkillBridge backend features in NestJS using the repository's modular-monolith and clean-code conventions.
---

Read `docs/architecture.md`, `docs/domain-model.md`, `docs/authorization-matrix.md`, and `docs/api-conventions.md`. Put transport concerns in controllers and DTOs, orchestration in application services/use cases, rules in domain code, and persistence behind repository interfaces. Use guards for identity/role checks but enforce ownership and business authorization in use cases. Validate inputs, map domain errors to stable API errors, and add tests for transitions and authorization.
