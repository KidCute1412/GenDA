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

## Approved target persistence for contributor onboarding

The current schema still contains `STUDENT` and `student_profiles`. Migration to the approved `CONTRIBUTOR` model must preserve existing accounts/profile data and be coordinated with enum constraints, JPA mappings, OpenAPI, frontend routes and seeds; never rewrite an applied migration.

- `auth` owns account email-verification state and OTP challenges. A challenge stores user/purpose, OTP hash, expiry, failed-attempt count, resend/creation time and consumption/invalidation time; it never stores the raw OTP. Enforce at most one current challenge per account and purpose, and index expiry/lookup fields used by confirmation and cleanup.
- `users` owns contributor profile fields and completeness inputs. Background type is explicit structured data; student-specific fields are optional/conditional rather than properties of the system role.
- Education is a one-to-many relational child of the contributor profile, not a JSON column. Each entry has its own stable ID and owner/profile foreign key, institution, field of study, education level, optional degree name, start/end period, status, optional description and timestamps. Deletion is an explicit owned-profile operation. Education rows are not part of profile-completeness or `canApplyGeneral` calculations.
- `users` persists SME business profiles and verification state separately from `auth` account/email state. Store the submitted identity fields, `PENDING`/`VERIFIED`/`REJECTED` status, reviewer, decision time and mandatory rejection reason; enforce allowed transitions and tax-code uniqueness where present. Admin decisions are audit records, not destructive overwrites of the submitted identity.
- `users` owns CV metadata and lifecycle (`UPLOADING`, `PROCESSING`, `READY`, `REJECTED_TECHNICAL`), including private object key, original filename, declared/detected type, size, checksum, validation result/reason and timestamps. File bytes do not enter PostgreSQL.
- GenDA does not persist student-verification evidence or status. A future `EDUCATION_CREDENTIAL` would require a separate requirement and migration; do not add verification columns to self-declared education entries speculatively.
- `canApplyGeneral` is derived from account, profile and current CV state and is not persisted as a mutable boolean. Cross-module reads use an application facade/projection rather than direct foreign repository access.
- SME session eligibility is likewise derived from active account + verified email in `auth` and business `VERIFIED` in `users`; do not duplicate the business-verification status in both modules.
- `projects` stores the selected complexity as a constrained value (`BASIC`, `MEDIUM`, `HIGH`) and budget as an integer amount in VND. Keep the global 1,000,000-5,000,000 VND range as a database constraint; enforce the policy-dependent cross-field minimum in the `projects` domain/application layer at submission and publication.
- Complexity minimums are server-owned product policy, not frontend constants or SME-editable rows. Until OQ-08 is resolved and an ADR chooses a persistence/versioning model, do not add speculative policy tables. A moderation return records actor, reason, timestamp, and optional suggested complexity without overwriting the SME's submitted scope, complexity, or budget.

