---
name: jpa-database
description: Change SkillBridge PostgreSQL persistence using JPA/Hibernate and Flyway with relational integrity and module ownership.
---

Read `docs/domain-model.md` and `docs/database-conventions.md`. Keep JPA types in owning infrastructure and map to domain/application models. Use reviewed Flyway SQL in `apps/api/src/main/resources/db/migration`; Hibernate validates, never auto-updates schema. Preserve foreign keys, constraints and query indexes. Never edit applied migrations or auto-baseline populated databases. Use application transactions and deterministic idempotent explicit seeds. Local and Supabase share migrations, not automatic data transfer. Verify database behavior against PostgreSQL. Supabase session-pooler JDBC uses TLS and a small Hikari pool; no credentials in source.
