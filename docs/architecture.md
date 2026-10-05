# SkillBridge Architecture

## Stack and current implementation

SkillBridge is a mixed-language monorepo: Next.js/TypeScript frontend, Java 21 / Spring Boot 4.0.8 backend. pnpm 10.15.0 and Turborepo manage JavaScript workspaces; Maven Wrapper 3.9.13 builds Java. The API workspace package bridges root commands to Maven and has no Node server.

```text
apps/web             Next.js UI, feature packages, Vercel deployment
apps/api             Spring Boot modular monolith, Maven, Render Docker deployment
packages/api-client  generated OpenAPI types and openapi-fetch transport
packages/config      existing shared frontend configuration placeholders
```

Persistence uses PostgreSQL, Spring Data JPA/Hibernate and Flyway. Springdoc 3.0.3 generates the code-first REST contract. See [ADR 0002](decisions/0002-spring-boot-and-docker.md), [API conventions](api-conventions.md) and [database conventions](database-conventions.md).

**Current capability:** the migrated backend implements only the existing `GET /api/v1/health`; there were no business endpoints, tables or authentication to migrate. Flyway V1 initializes migration history without inventing domain tables. The UI remains a browser demo backed by localStorage and sample data. Simulated users, transitions and balances are not production authorization/persistence. Replace demo adapters as real backend vertical slices are implemented.

## Modular monolith and business ownership

One application/JAR, one relational database. Organize packages under `vn.skillbridge.<module>`, not separate Maven projects or services. Frontend features correspond to business ownership; student/SME/admin routes do not duplicate domains.

| Backend module | Frontend feature | Ownership |
| --- | --- | --- |
| auth | auth | Identity and session boundary |
| users | users | Profiles, verification, skills |
| projects | projects | Lifecycle, ownership, publication |
| applications | applications | Applications, selection, assignments |
| matching | projects / applications | Recommendations; no dedicated frontend feature yet |
| milestones | milestones | Deliverables, acceptance, simulated escrow |
| reviews | reviews | Reviews and eligibility |
| certificates | portfolio | Verified evidence/certificates; portfolio is the UI name |
| admin | admin | Moderation/audit entrypoints; domain mutations stay in their owning modules |

`workspace` composes domains and owns view state/navigation. `demo-ledger` is a temporary frontend adapter. `platform` owns health, HTTP errors and configuration, not business rules.

Create module packages when behavior exists, not empty scaffolding:

```text
projects/
  api/             controllers, HTTP DTOs, validation, serialization
  application/     use cases, public facade, repository ports, transactions
  domain/          entities/value objects, lifecycle rules, domain errors
  infrastructure/  JPA entities/repositories/adapters, external integrations
```

- Controller -> application -> domain and repository port. Infrastructure implements ports.
- Domain imports no Spring, JPA, servlet, HTTP or infrastructure types.
- Application may use Spring transaction/service annotations; never HTTP DTOs or infrastructure repositories/entities.
- Cross-module calls use public application facades with IDs and explicit models. Never access another module's private repositories/entities or mutate its tables directly.
- Shared kernel contains only demonstrated shared concepts. No speculative event bus, Spring Modulith, queue or Redis.
- ArchUnit checks domain purity/application dependency direction. Add concrete cross-module checks as real modules appear; review ownership as well as tests.

## API and authorization

All business endpoints use `/api/v1`. Controllers expose explicit DTOs, never ORM entities. Jakarta Bean Validation validates input; unknown JSON fields are rejected. Use cases enforce roles, ownership, state transitions and transactions.

Springdoc emits `/api/v1/openapi` locally. Export the normalized snapshot and regenerate `packages/api-client`; Java source types are not shared with TypeScript. Production OpenAPI is disabled by default.

Health preserves `{ status: "ok", service: "genda-api" }`, returning 503 if PostgreSQL is unavailable. Compose and Render use it for readiness. Errors use `{ code, message, requestId }`, without SQL, credentials or stack traces.

No real auth existed in the scaffold. Mock role selection is not identity. Choose the auth provider/session contract before implementing protected endpoints, and enforce the authorization matrix on the backend.

## Frontend

Keep feature-oriented UI and DD-10 Neo-Industrial Ledger. Pages compose features; features use generated clients and local view state with explicit server/client boundaries. Server calls use `API_INTERNAL_URL`; browsers use `NEXT_PUBLIC_API_URL`. Database credentials never enter frontend code.

Next.js `GET /api/health` uses the generated client to verify frontend -> API -> database. It does not migrate demo workflows to real persistence.

## Local runtime

`compose.yaml` runs frontend/backend/PostgreSQL. Prerequisites: Docker Desktop with Linux containers, Compose 5.0.2+, Windows Terminal. `start.bat` creates local `.env` if missing, validates configuration, builds/waits for health, then opens a new terminal with two panes.

Frontend Watch syncs source for Next.js HMR. Backend Watch rebuilds/restarts after Java/resources/POM changes; this is automatic reload, not instantaneous JVM hot swap. One shared Compose watcher runs in the background; each pane follows only its service logs.

Host defaults: frontend 3000, backend 3001, database 15432, bound to loopback. Inside Docker use `database:5432` and `backend:3001`; browsers use localhost. Database data lives in a named volume.

Closing panes leaves the shared watcher and containers running. `stop.bat` stops the watcher and containers and retains data. Close old watch panes before starting new ones. Never use `docker compose down -v` unless intentionally deleting local data.

## Hosting and operations

- Vercel: Next.js, project root `apps/web`, workspace sources available.
- Render: backend Dockerfile, Java 21 JRE, non-root, one instance, heap cap.
- Supabase: PostgreSQL over backend JDBC only; no implicit Supabase Auth or browser database access.
- Use session pooler port 5432 for IPv4-compatible JDBC/Flyway, TLS and a small Hikari pool.
- Flyway runs before serving traffic; failure stops startup. Hibernate validates schema.
- Render binds `0.0.0.0:$PORT`. Logs go to stdout; secrets come from hosting settings.
- CORS permits configured exact origins, not every Vercel preview.
- Render Free can sleep/cold-start; test before presenting. Filesystem is ephemeral.
- Rollback code must remain compatible with applied migrations; never delete migration history.

See [local development](local-development.md) for launch/reload/checks and the concise [deployment guide](deployment.md) for hosting. Follow [definition of done](definition-of-done.md): Java tests/build, frontend checks, generated contract, restart persistence, reload, CORS and online checks where credentials exist. Report unverified environments separately.
## Decisions needed when implementing business features

Local infrastructure and deployment target choices are settled by ADR 0002. These do not block local launch:
- Authentication provider and session/token contract: choose before protected APIs; browser demo login is not authentication.
- Object storage provider and upload authorization: choose before file deliverables; no durable uploads on Render filesystem.
- Confirm group applications and the project-level SUBMITTED transition before their schema/use cases; existing OQ-02/OQ-03 in requirements describe the alternatives.
