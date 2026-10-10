# Database Conventions

- PostgreSQL is the system of record; Prisma is the only application database client.
- Database table and column names use snake_case. Prisma model names use singular PascalCase and explicit `@@map`/`@map` when physical names differ.
- Every entity has a stable id and `createdAt`; mutable records generally also have `updatedAt`.
- Use foreign keys, unique constraints, check constraints where practical, and indexes based on real query paths.
- Schema changes are made through reviewed Prisma migrations.
- Seed data must be deterministic and safe to run repeatedly.
- Use transactions for state transitions spanning multiple records.
- Do not store uploaded files in PostgreSQL; store metadata and an object-storage key.
- Avoid JSON for relationships or fields that need querying, validation, or referential integrity.
- Do not use database cascades for business workflows unless the deletion policy is documented; prefer explicit application use cases for important records.

