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

The account-role schema uses `CONTRIBUTOR`. Account lifecycle is `ACTIVE` or `DISABLED`; email-verification columns and OTP tables are removed in V15. Historical registration states are migrated to ACTIVE, while DISABLED accounts stay disabled. The legacy `student_profiles` table/name remains until the contributor-profile migration.
- `users` owns contributor profile fields and completeness inputs. Background type is explicit structured data; student-specific fields are optional/conditional rather than properties of the system role.
- Education is a one-to-many relational child of the contributor profile, not a JSON column. Each entry has its own stable ID and owner/profile foreign key, institution, field of study, education level, optional degree name, start/end period, status, optional description and timestamps. Deletion is an explicit owned-profile operation. Education rows are not part of profile-completeness or `canApplyGeneral` calculations.
- SME registration identity remains in auth persistence for MVP. Historical `sme_approval_status` is preserved but unused; new registrations leave it null. V14 activates previously email-verified waiting SMEs, preserving DISABLED accounts. No business-review tables are added.
- `users` owns CV metadata and lifecycle (`UPLOADING`, `PROCESSING`, `READY`, `REJECTED_TECHNICAL`), including private object key, original filename, declared/detected type, size, checksum, validation result/reason and timestamps. File bytes do not enter PostgreSQL.
- GenDA does not persist student-verification evidence or status. A future `EDUCATION_CREDENTIAL` would require a separate requirement and migration; do not add verification columns to self-declared education entries speculatively.
- `canApplyGeneral` is derived from account, profile and current CV state and is not persisted as a mutable boolean. Cross-module reads use an application facade/projection rather than direct foreign repository access.
- SME session eligibility is an active account, identical to Contributor. No business-review gate applies in MVP.
- `projects` stores the selected complexity as a constrained value (`BASIC`, `MEDIUM`, `HIGH`) and budget as an integer amount in VND. Keep the global 1,000,000-5,000,000 VND range as a database constraint; enforce the policy-dependent cross-field minimum in the `projects` domain/application layer at submission and publication.
- Complexity budget ranges (decided in OQ-08) are server-owned product policy, not frontend constants or SME-editable rows. Keep them as `projects` module configuration; do not add policy tables until an ADR chooses a persistence/versioning model. A moderation return records actor, reason, timestamp, and optional suggested complexity without overwriting the SME's submitted scope, complexity, or budget. V14 stores this in `project_moderation_events` (`SUBMITTED`, `PUBLISHED`, `RETURNED`), adds `owner_id`, `complexity`, `updated_at`, `submitted_at` and `published_at` to `projects`, and lets draft scope columns be null while a check constraint requires them in every non-draft state. Project transitions lock the project row (`SELECT ... FOR UPDATE`).
- V15 renames `student_profiles` to `contributor_profiles` (school/major/study year become the first `contributor_education` row; study year becomes `background_type`, major becomes `specialization`) and adds `contributor_education`, `contributor_cvs` (metadata, only accepted files) with `contributor_cv_files` (PDF bytes in `BYTEA` until OQ-07 selects object storage), and `contributor_experience_records`. The experience ledger holds one row per completed project with a title/SME/level snapshot; XP and tier are never stored, they are derived from these rows at read time by the server-side `ExperiencePolicy`. Rows are written only by the future project-completion use case; the demo profile seeds history fixtures.
- V16 adds `applications` (project by `public_id`, contributor, cover letter, status, `eligibility_source` with `SME_INVITATION` reserved, `decided_at`/`decided_by` required exactly for `ACCEPTED`/`REJECTED`). Partial unique indexes enforce one active application per contributor and project (FR-APP-02) and one `ACCEPTED` application per project (BR-05). `projects` gains `assigned_contributor_id` and `started_at`, required whenever the project is `IN_PROGRESS`.

## Milestone persistence

V20 creates `milestones`, `handoffs`, `handoff_attachments`, `milestone_ai_reviews`, `milestone_ai_feedback` and `milestone_events`. It snapshots plans for existing real IN_PROGRESS assignments; browser data is never imported. New assignments create snapshots within the acceptance transaction.

Milestone IDs and criterion IDs remain stable across revisions. Plan criteria, revision links, bounded AI report/source snapshots and warnings use text JSON mapped inside the owning JPA adapter. Attachment rows contain metadata/object keys only; original bytes are private Supabase Storage objects.

V21 strengthens decision audit/reason checks and enforces that attachment and handoff belong to the same milestone. Unique constraints enforce plan position and revision numbering; a partial unique index allows only one PROCESSING/SUCCEEDED AI attempt per revision. Failed attempts stay in history; feedback is unique per review/actor.

Retain submitted evidence and decision history. Hourly maintenance removes unsubmitted attachments older than 24 hours, sharing the project's transition lock with submit. A failed object deletion leaves metadata for retry. No scheduled deletion of committed revisions or provider reports is introduced.

