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

**Current capability:** the backend implements health/readiness, account registration, JWT cookie authentication, email OTP verification, the contributor profile (self-declared background, specialization, canonical skills), optional education history, a private technically validated PDF CV, the application-readiness checklist, derived XP and tier (`users` module), applications with a server-side readiness and tier gate, SME applicant review ranked by explicit skill match, shortlisting and single acceptance that starts the project (`applications`, `matching`), the published-project catalog, and the SME project lifecycle up to publication: an approved SME creates and edits drafts, submits them for review, and an admin publishes them or returns them to draft with a reason (`projects` module, admin entrypoint in `admin`). Every submit/publish/return is recorded in `project_moderation_events`. Authentication exposes CSRF bootstrap, `CONTRIBUTOR`/SME registration, OTP confirm/resend, login, refresh, logout and current-user endpoints. Registration creates a pending account, sends a six-digit OTP and issues no access/refresh cookies. OTP challenges are hash-only, single-use, expiring, attempt-limited and resend/source-rate-limited. A valid OTP activates a contributor or moves an SME to `EMAIL_VERIFIED`; SME business approval remains independent. Flyway owns users, OTP challenges/attempt audit, profiles, registration identity fields and revocable refresh sessions; local Compose reads an external transactional SMTP account from `apps/api/.env` and sends verification messages to the registered mailbox. CV storage, matching, applications, and the remaining workflows still use sample/local browser data; when a contributor applies to a backend-published project, the browser `demo-ledger` copies that project locally so the demo application, workspace and review steps keep working until `applications` has an API.

**Approved target direction (partially implemented):** the person-side actor is now `CONTRIBUTOR`; student remains only a future self-declared background type. Registration and six-digit email OTP verification are implemented without issuing a full session before verification. The `users` module owns contributor profile completeness, self-declared education history, private CV lifecycle/technical validation, and SME business-verification records. It exposes eligibility/approval facades instead of allowing `auth` or `applications` to read user persistence. Education is optional and does not affect general eligibility. GenDA does not collect or review student-status evidence. A `READY` CV is a technically valid artifact, not a GenDA endorsement. Admin reviews SME identity, not contributor education or CV content; AI CV review/scoring is outside MVP.

## Modular monolith and business ownership

One application/JAR, one relational database. Organize packages under `vn.skillbridge.<module>`, not separate Maven projects or services. Frontend features correspond to business ownership; contributor/SME/admin routes do not duplicate domains. Existing `/student/*` routes are legacy implementation and will be migrated with the role/API change rather than renamed independently.

| Backend module | Frontend feature | Ownership |
| --- | --- | --- |
| auth | auth | Identity and session boundary |
| users | users | Contributor/SME profiles, SME business verification, education history, profile completeness, CV lifecycle, skills |
| projects | projects | Lifecycle, ownership, complexity taxonomy, level budget-range policy, moderation and publication |
| applications | applications | Applications, selection, assignments |
| matching | projects / applications | Recommendations; no dedicated frontend feature yet |
| milestones | milestones | Deliverables, acceptance, simulated escrow |
| reviews | reviews | Reviews and eligibility |
| certificates | — | Out of scope: verified portfolio was removed; CV remains an unverified contributor artifact owned by `users` |
| admin | admin | Moderation/audit entrypoints; domain mutations stay in their owning modules |
| assistant (planned) | assistant | Student job-search coaching (assistant Gen): read-only rules over users/applications/projects/milestones/reviews facades; see [assistant.md](assistant.md) |

`workspace` composes domains and owns view state/navigation. `demo-ledger` is a temporary frontend adapter. The `opportunities` frontend feature (gigs and events, see [opportunities.md](opportunities.md)) is likewise demo-only over `demo-ledger`; a separate backend `opportunities` module is planned, not a variant of `projects`. The `assistant` frontend feature currently evaluates its rules in the browser over `demo-ledger`; the backend module is created when applications and milestones have real APIs. `platform` owns health, HTTP errors and configuration, not business rules.

### Backend module organization

Create packages only when working behavior exists; do not add empty scaffolding. Every business module starts with the same four layers:

```text
<module>/
  api/             HTTP controllers, request/response DTOs and exception mapping
    dto/           transport-only request and response models
  application/     use cases, transactions, commands/results and outbound ports
  domain/          framework-free entities, value objects and business rules
  infrastructure/  implementations of application ports and framework configuration
    config/         Spring configuration and typed properties owned by the module
    security/       authentication/security implementations owned by the module
    persistence/    JPA entities, Spring Data interfaces and repository adapters
```

When one layer grows, group its files by business capability rather than by technical class type. Repeat the same capability name across the layers where it has behavior. Do not create a capability directory for a single unrelated helper or force every layer to contain every capability.

The current `auth` module is the reference structure:

```text
auth/
  api/
    dto/                         login, registration, CSRF and user HTTP models
    AuthController.java
    AuthCookieWriter.java
    AuthExceptionHandler.java
  application/
    account/                     login, registration, password and user repository port
    session/                     token issuance, refresh, logout and session repository port
    AuthException.java           error shared by auth use cases
  domain/
    account/                     AuthUser, UserRole and RegistrationIdentity
    session/                     RefreshSession and its usability rule
  infrastructure/
    config/                      AuthProperties and auth bean configuration
    security/                    JWT, BCrypt, CSRF and Spring Security implementations
    persistence/
      account/                   auth-user JPA mapping and repository adapter
      session/                   refresh-session JPA mapping and repository adapter
```

The package communicates ownership, so avoid repeating layer names inside capability names. For example, use `application.session.SessionService`, not `application.session.SessionApplicationService`.

### Backend naming conventions

Names describe the architectural role of a type, not only the technology it happens to use:

| Role | Pattern | Auth example |
| --- | --- | --- |
| HTTP controller | `<Capability>Controller` | `AuthController` |
| HTTP request/response | `<Action>Request`, `<Resource>Response` | `LoginRequest`, `AuthUserResponse` |
| Application use case | `<Action>Service` or `<Capability>Service` | `LoginService`, `RegistrationService`, `SessionService` |
| Use-case input/output | `<Action>Command`, `<Action>Result` | `RegistrationCommand`, `RegistrationResult` |
| Domain model/value object | business name without framework suffix | `AuthUser`, `RegistrationIdentity`, `RefreshSession` |
| Application repository port | `<Aggregate>Repository` | `AuthUserRepository`, `RefreshSessionRepository` |
| Other outbound application port | capability name ending in `Service` | `PasswordService`, `TokenService` |
| Handwritten JPA adapter | `Jpa<Aggregate>RepositoryAdapter` | `JpaAuthUserRepositoryAdapter` |
| Spring Data interface | `SpringData<Aggregate>Repository` | `SpringDataAuthUserRepository` |
| JPA-mapped type | `<Aggregate>JpaEntity` | `AuthUserJpaEntity`, `RefreshSessionJpaEntity` |
| Typed configuration | `<Capability>Properties` | `AuthProperties` |
| Security/filter implementation | technology or responsibility first | `JwtTokenService`, `CsrfProtectionFilter` |

Use `Repository` consistently for persistent aggregate access. Reserve `Store` for a genuinely different key-value, cache or object-storage abstraction. The `Adapter` suffix is required for handwritten persistence implementations so they remain distinguishable from Spring Data interfaces. Only JPA-mapped classes use the `JpaEntity` suffix; domain models never carry persistence or framework suffixes.

### Backend dependency direction

- Controller -> application use case -> domain and application port; infrastructure implements application ports.
- Domain imports no Spring, JPA, servlet, HTTP, application or infrastructure types.
- Application may use Spring transaction/service annotations, but never imports HTTP DTOs, JPA entities, Spring Data interfaces or infrastructure adapters.
- Infrastructure may depend inward on application ports and domain models. JPA entities are mapped to domain/application models inside the adapter and never leave infrastructure.
- Cross-module calls use public application facades with IDs and explicit models. Never access another module's private repositories/entities or mutate its tables directly.
- Shared kernel contains only demonstrated shared concepts. No speculative event bus, Spring Modulith, queue or Redis.
- ArchUnit checks domain purity and application dependency direction. Add concrete cross-module checks as real modules appear; review ownership as well as tests.

## API and authorization

All business endpoints use `/api/v1`. Controllers expose explicit DTOs, never ORM entities. Jakarta Bean Validation validates input; unknown JSON fields are rejected. Use cases enforce roles, ownership, state transitions and transactions.

Springdoc emits `/api/v1/openapi` locally. Export the normalized snapshot and regenerate `packages/api-client`; Java source types are not shared with TypeScript. Production OpenAPI is disabled by default.

Health preserves `{ status: "ok", service: "genda-api" }`, returning 503 if PostgreSQL is unavailable. Compose and Render use it for readiness. Errors use `{ code, message, requestId }`, without SQL, credentials or stack traces.

Authentication uses a five-minute access JWT and a rotating refresh JWT in scoped `HttpOnly` cookies. Refresh sessions are fingerprinted in PostgreSQL and revoked on logout. Refresh TTL is 24 hours by default or seven days when the user remembers the device. Cookie mutations require a double-submit CSRF token; CORS allows credentials only from configured exact origins. Frontend role checks remain UX only.

The target email-verification flow stores only an OTP hash plus expiry, failed-attempt count, resend metadata and consumption time. Confirmation and resend are rate-limited; issuing a new OTP invalidates the old one. No access/refresh session is issued before email verification. SME approval remains an additional independent gate.

`users` owns SME verification evidence, `PENDING`/`VERIFIED`/`REJECTED` state and review audit. Admin controllers invoke the public `users` verification use case. When an SME logs in, `auth` queries a narrow public approval facade in `users`; it never reads SME tables or repositories directly. Email verification, business verification and per-project moderation remain separate gates.

`projects` owns project complexity, the level budget-range policy, and all submit/review/publish transitions. The backend is authoritative for policy values; the frontend consumes them through the generated contract and never decides eligibility from local constants. An admin moderation endpoint invokes a `projects` application use case: it may publish a consistent project or return an under-classified project to `DRAFT` with a reason and suggested level, but it cannot reach into the SME's project repository to rewrite scope, complexity, or budget.

CVs and SME verification evidence are private object-storage objects when files are required. Upload processing validates file type/signature, size, readability, password protection and configured malware scanning before marking a CV `READY`. Database rows hold metadata and object keys, never file bytes; access uses short-lived authorization. The exact storage/scanner provider remains an implementation decision under OQ-07.

## Frontend

Keep feature-oriented UI and DD-10 Neo-Industrial Ledger. Pages compose features; features use generated clients and local view state with explicit server/client boundaries. Server calls use `API_INTERNAL_URL`; browsers use `NEXT_PUBLIC_API_URL`. Database credentials never enter frontend code.

Next.js `GET /api/health` uses the generated client to verify frontend -> API -> database. It does not migrate demo workflows to real persistence.

## Local runtime

`compose.yaml` runs frontend/backend/PostgreSQL. Prerequisites: Docker Desktop with Linux containers, Compose 5.0.2+, Windows Terminal. `start.bat` creates local `.env` if missing, validates configuration, builds/waits for health, then opens a new terminal with two panes.

Frontend Watch syncs source for Next.js HMR. Backend Watch rebuilds/restarts after Java/resources/POM changes; this is automatic reload, not instantaneous JVM hot swap. One shared Compose watcher runs in the background; each pane follows only its service logs.

Host defaults: frontend 3000, backend 3001 and database 15432, bound to loopback. Inside Docker use `database:5432` and `backend:3001`; browsers use localhost. The backend connects to the external SMTP host configured in `apps/api/.env`. Database data lives in a named volume.

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
- Object storage provider and upload authorization: choose before file deliverables; no durable uploads on Render filesystem.
- Confirm group applications and the project-level SUBMITTED transition before their schema/use cases; existing OQ-02/OQ-03 in requirements describe the alternatives.
