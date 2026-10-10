# API Conventions

## Contract

Spring Boot code-first OpenAPI uses springdoc, controller metadata, Java DTOs and Jakarta validation. Local document: `/api/v1/openapi`; production disables it by default.

With backend running:
```sh
node scripts/export-openapi.mjs
corepack pnpm --filter @genda/api-client generate
```

Commit `packages/api-client/openapi.json` and generated `src/schema.d.ts` with API changes. Export removes environment-specific server URLs. Frontend imports `@genda/api-client` (openapi-typescript/openapi-fetch), not hand-written response types. CI re-exports/regenerates and rejects drift.

## Request/response

- Prefix backend endpoints with `/api/v1`; use plural resources and HTTP semantics.
- Validate Java DTOs with Jakarta Bean Validation and `@Valid`; reject unknown JSON properties.
- Pagination: `{ data, page, pageSize, total }`.
- Errors: `{ code, message, details?, requestId }`; no SQL, stack traces or credentials. Use stable domain error codes for business failures.
- Never serialize JPA/Hibernate entities; use explicit DTOs/mapping.
- Preserve health route and response `{ status: "ok", service: "genda-api" }`; database failure returns safe 503.
- Next.js `/api/health` is an operational connectivity check, not a duplicate business API.

## Authentication/authorization

The implementation exposes `/api/v1/auth`: `GET /csrf`, `POST /register`, `POST /login`, `POST /refresh`, `POST /logout`, and `GET /me`. Registration creates an active Contributor or SME account without sending email; the user signs in separately. Disabled accounts cannot sign in. Email verification, password reset, and CAPTCHA are deferred from this MVP.

Registration accepts `CONTRIBUTOR` and `SME`; admin roles are provisioned internally. SME registration carries self-declared business identity data. Login and registration are rate-limited by the backend.

Access and refresh JWTs are returned only as scoped `HttpOnly` cookies, never in JSON. Access expires after five minutes. Refresh expires after 24 hours, or seven days when `rememberDevice=true`, and rotates on use.

SME registration keeps validated tax-code/website data as self-declared business identity. MVP has no admin business-approval gate. The optional `smeApprovalStatus` response field is deprecated historical data, never an authorization input.

`POST /logout` is idempotent: it revokes the current refresh-session record when a valid refresh cookie exists, expires both authentication cookies using their original paths, and returns `204 No Content`. The access JWT remains stateless; the backend stores only the refresh-token fingerprint and revocation metadata, never the raw token.
## Contributor profile and CV target

### SME profile (implemented)

`GET/PUT /api/v1/users/me/sme-profile` requires an active SME account and acts only on the authenticated user. GET returns `displayName`, `email`, `taxCode`, `companyWebsite`, `description`, `industry`; an account without a saved profile receives its registration details and empty optional fields. PUT accepts only `displayName` (required, max 180), `description` (optional, max 2000), `industry` (optional, max 120). Text is trimmed; blank optional fields become null. Email and registration identity are read-only. Successful writes return the updated profile; invalid transport input returns 400, invalid normalized text returns 422 `SME_PROFILE_INVALID`, and denied accounts return 403. The existing cookie/CSRF rules apply. Name and profile updates share one transaction.

Implemented application endpoints:

| Endpoint | Actor | Behavior |
|---|---|---|
| `POST /api/v1/applications` | Contributor | Applies to a `PUBLISHED` project with a cover letter (80-3000 characters after trimming). Server-side gate: `422 APPLICATION_NOT_ELIGIBLE` with `details.missing` (`ACCOUNT_INACTIVE`, `PROFILE_INCOMPLETE`, `CV_NOT_READY`, `TIER_REQUIRED`), `requiredTier`, `currentTier`, `missingXp`; `409 APPLICATION_ALREADY_EXISTS` for a second active application; `409 PROJECT_NOT_OPEN` once the project started; `422 APPLICATION_COVER_LETTER_LENGTH` |
| `GET /api/v1/applications/me` | Contributor | Own applications, newest first, with project title, SME, budget, level and status |
| `POST /api/v1/applications/{id}/withdraw` | Contributor | `SUBMITTED`/`SHORTLISTED` to `WITHDRAWN`; `409 APPLICATION_INVALID_TRANSITION` otherwise |
| `GET /api/v1/sme/projects/{projectId}/applications` | Owning SME | Applicants ranked by skill match (FR-MAT-03), each with tier, XP, completed projects per level, self-declared profile and education, match explanation, CV metadata; withdrawn applications omitted; `contactEmail` only for the accepted applicant |
| `GET /api/v1/sme/applications/counts?projectId=` | Owning SME | Open and total applications per owned project |
| `POST /api/v1/sme/applications/{id}/shortlist` | Owning SME | `SUBMITTED` to `SHORTLISTED` |
| `POST /api/v1/sme/applications/{id}/accept` | Owning SME | One transaction: the project row is locked, moves `PUBLISHED` to `IN_PROGRESS` with the contributor assigned, the application becomes `ACCEPTED` and every other open application `REJECTED`, each recording the deciding SME and time |
| `GET /api/v1/sme/applications/{id}/cv` | Owning SME | The applicant's current READY CV, `inline`, `no-store` |

Applying reads the project under a shared row lock, so an acceptance in progress cannot interleave with a new application. springdoc names schemas by simple class name, so API DTO names must be unique across modules; `ArchitectureTest` enforces this.

Implemented contributor endpoints (role `CONTRIBUTOR`, own data only):

| Endpoint | Behavior |
|---|---|
| `GET/PUT /api/v1/users/me/profile` | Display name, `backgroundType`, `specialization`, 1-8 canonical skill codes in the contributor's order; `complete` when all are present |
| `GET/POST /api/v1/users/me/education`, `PUT/DELETE /api/v1/users/me/education/{id}` | Up to 10 self-declared entries; months as `YYYY-MM`; finished statuses need a past end month (`422 EDUCATION_INVALID_PERIOD`); responses carry `selfDeclared: true` |
| `GET /api/v1/users/me/cv` | Current CV metadata or `404 CV_NOT_FOUND` |
| `PUT /api/v1/users/me/cv` (multipart `file`) | Synchronous technical validation; READY CV on success, otherwise `422 CV_REJECTED_TECHNICAL` with `details.reason` (`EMPTY`, `TOO_LARGE`, `NOT_PDF`, `CORRUPTED`, `PASSWORD_PROTECTED`) and the current CV unchanged |
| `GET /api/v1/users/me/cv/file` | The owner's PDF, `inline`, `no-store`, `nosniff` |
| `GET /api/v1/users/me/readiness` | `accountActive`, ``, `profileComplete`, `cvReady`, `ready` |
| `GET /api/v1/users/me/experience` | `totalXp`, `tier`, next-tier progress, `basicXpCap`, the tier/level policy and newest-first history with `xpAwarded`/`capped` |

The target contract will add private CV upload/status/replace operations under `/api/v1/users/me/cv` and an application-readiness representation derived from account, profile and CV state. Contributors may browse projects while incomplete; `POST /applications` remains the authoritative enforcement point. A `READY` CV indicates only successful technical/security validation, not verified content. MVP accepts the PDF as multipart and stores it in Postgres; presigned uploads replace this once OQ-07 selects object storage.

Education is a child collection of the contributor profile. The target contract uses `GET` and `POST /api/v1/users/me/education`, plus `PUT` and `DELETE /api/v1/users/me/education/{educationId}`. Requests carry institution, field of study, education level, optional degree name, start/end period, education status and optional description. The API validates ownership and consistent periods/statuses; responses identify entries as self-declared. Education is not included in the application-readiness predicates.

## Project complexity and budget policy

The project create/update contract includes `complexity` with one of `BASIC`, `MEDIUM`, or `HIGH`. The backend also exposes the current project-creation policy (allowed levels, global budget range, and the inclusive minimum/maximum budget for each level: `BASIC` 1,000,000-1,500,000, `MEDIUM` 1,500,000-3,500,000, `HIGH` 3,500,000-5,000,000 VND) so the generated frontend client can render the same policy without hard-coded business constants.

Submitting a draft whose budget is outside the selected level's range returns HTTP `422` with stable code `PROJECT_BUDGET_OUTSIDE_LEVEL_RANGE` and details containing `complexity`, `minimumBudget`, `maximumBudget`, and `submittedBudget`. The backend repeats this validation before publication even if the draft was created under an older client session.

When admin review identifies a scope that is materially more complex than its declared level, the moderation command returns the project to `DRAFT` and requires a reason; it may also include `suggestedComplexity`. This is a review decision, not an admin-side edit of the SME's project. The project-creation-policy resource shape is committed in OpenAPI together with generated clients.

Implemented project authoring and moderation endpoints:

| Endpoint | Actor | Behavior |
|---|---|---|
| `GET /api/v1/projects/creation-policy` | Anyone | Overall budget range and the inclusive `minimumBudget`/`maximumBudget` of each level |
| `GET /api/v1/sme/projects` | Active SME | Own projects in every state, most recently updated first |
| `POST /api/v1/sme/projects` | Active SME | Create a `DRAFT`; only `title` is required, `201 Created` |
| `GET /api/v1/sme/projects/{projectId}` | Active SME | One own project; another SME's project returns `404 PROJECT_NOT_FOUND` |
| `PUT /api/v1/sme/projects/{projectId}` | Active SME | Replace draft content; a non-draft returns `409 PROJECT_INVALID_TRANSITION` |
| `POST /api/v1/sme/projects/{projectId}/submit` | Active SME | `DRAFT → PENDING_REVIEW`; incomplete content returns `422 PROJECT_NOT_READY` with `details.issues` |
| `GET /api/v1/admin/projects/pending` | Admin | Review queue, oldest submission first |
| `POST /api/v1/admin/projects/{projectId}/publish` | Admin | `PENDING_REVIEW → PUBLISHED`, revalidating readiness and the level range |
| `POST /api/v1/admin/projects/{projectId}/return` | Admin | `PENDING_REVIEW → DRAFT` with `reason` (10-1000 characters) and optional `suggestedComplexity` |

Owner/admin responses (`ManagedProjectResponse`) include `submissionIssues`, the reasons the project could not enter review today, and `latestReturn` while the latest review decision returned it to draft. A draft budget outside the overall MVP range returns `400 PROJECT_BUDGET_OUT_OF_RANGE`. Published catalog responses now also carry `complexity`. Business errors may include a `details` object.

## Compatibility

Preserve current routes/statuses/semantics. Prefer additive fields. Renames/removals/semantic changes require an ADR and versioning decision. Generated artifacts must reproduce in CI; Java source models are not shared with TypeScript.


Login is limited to 10 requests per normalized email and 30 per source in 15 minutes; registration to 5 per source per hour. Denial returns `429 AUTH_RATE_LIMITED` and `Retry-After` seconds, exposed through CORS. Counters are bounded, process-local and reset on restart; a shared store is required before adding replicas.
