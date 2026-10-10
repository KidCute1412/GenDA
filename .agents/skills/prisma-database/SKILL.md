---
name: prisma-database
description: Design or change SkillBridge PostgreSQL and Prisma persistence while preserving relational integrity, migrations, and module ownership.
---

Read `docs/domain-model.md` and `docs/database-conventions.md`. Model relationships explicitly and add constraints/indexes for real invariants and query paths. Use Prisma migrations, deterministic idempotent seeds, and transactions for multi-record transitions. Keep Prisma types in infrastructure/data-access code and map them to domain/application models. Add repository and integration tests for changed behavior.

