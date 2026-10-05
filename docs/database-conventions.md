# Database Conventions

- PostgreSQL is the system of record; backend persistence uses Spring Data JPA/Hibernate.
- JPA entities/repository adapters stay in the owning module's infrastructure. Map to domain/application models; never expose ORM entities from controllers or import another module's repositories.
- Tables/columns use snake_case with explicit mappings where needed. Use stable IDs, created timestamps and generally updated timestamps; prefer UUID for new IDs unless an existing contract requires otherwise.
- Enforce foreign keys, uniqueness, check constraints and query-driven indexes in SQL. Document deletion policies; cascades must not implement business workflows.
- Flyway files live in `apps/api/src/main/resources/db/migration`, named `V<number>__<description>.sql`. Commit them with entity/API/tests.
- Flyway is the only schema writer. Hibernate uses `ddl-auto=validate`, never automatic update/create in normal environments.
- V1 initializes migration history only because the previous backend had no business schema. Add real domain tables in V2+ as features appear.
- Never edit applied migrations, auto-baseline populated databases or clean hosted databases. Existing populated schemas require backup, explicit reviewed baseline and data-preserving migration.
- Coordinate migration numbers across the team. Seed demo data separately, deterministically and idempotently; production never runs demo seeds implicitly.
- Application use cases own transactions for multi-record transitions. Implement concurrency constraints/locking with the affected use case.
- Local PostgreSQL and Supabase use identical migrations; this does not transfer local records. Import/seed is separate.
- Supabase uses session-pooler JDBC, TLS and a small Hikari pool. Credentials belong only in private environment configuration.
- Files belong in object storage; database stores metadata/storage keys. Avoid JSON for relational fields requiring integrity or querying.

