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

The current implementation exposes `/api/v1/auth`: `GET /csrf`, `POST /register`, `POST /login`, `POST /refresh`, `POST /logout`, and `GET /me`; it still accepts `STUDENT` and `SME` and issues a session immediately to students. This is legacy behavior to be replaced by the approved target contract below.

The target registration contract accepts `CONTRIBUTOR` and `SME` and uses this sequence:

1. `POST /api/v1/auth/register` creates a pending account and sends a six-digit email OTP; it does not issue access or refresh cookies. An SME registration also carries business identity data required by FR-USR-12.
2. `POST /api/v1/auth/email-verifications/confirm` accepts the registered email and OTP. A correct, unexpired, unused code verifies the mailbox. A contributor may then receive a normal session; an SME must also satisfy the existing admin-approval rule before sign-in.
3. `POST /api/v1/auth/email-verifications/resend` issues a new OTP after the resend cooldown and invalidates the previous code.

OTP expires after a configurable duration (10 minutes by default), permits at most five failed confirmation attempts, is one-time, and is subject to resend/confirmation rate limits. Only a hash and lifecycle metadata are persisted; raw OTP values are never stored or logged. Expected business failures use stable codes such as `EMAIL_VERIFICATION_REQUIRED`, `OTP_INVALID`, `OTP_EXPIRED`, `OTP_ATTEMPTS_EXCEEDED`, and `OTP_RESEND_TOO_SOON`.

After email verification and any role-specific approval, access and refresh JWTs are returned only as scoped `HttpOnly` cookies, never in JSON. Access expires after five minutes. Refresh expires after 24 hours, or seven days when `rememberDevice=true`, and rotates on use.

For SME registrations, successful OTP confirmation moves the business-verification record to `PENDING`; it does not grant a full session. Admin-facing target endpoints list pending SME verifications and submit an approve or reject decision with a mandatory rejection reason. `users` owns the verification record and decision; `auth` queries its public application facade before issuing an SME session. Pending/rejected login attempts return stable `SME_NOT_APPROVED` information without credentials or sensitive evidence.

`POST /logout` is idempotent: it revokes the current refresh-session record when a valid refresh cookie exists, expires both authentication cookies using their original paths, and returns `204 No Content`. The access JWT remains stateless; the backend stores only the refresh-token fingerprint and revocation metadata, never the raw token.

Unsafe API requests require the `X-CSRF-Token` value issued by `GET /auth/csrf`; the browser also sends its matching CSRF cookie. Browser calls use credentials and CORS permits credentials only for exact configured origins. Production cross-site cookies require `AUTH_COOKIE_SECURE=true` and `AUTH_COOKIE_SAME_SITE=None`.

## Contributor profile and CV target

The current implementation lets authenticated students use `GET /api/v1/users/me/profile` and `PUT /api/v1/users/me/profile` with display name, school, major, study year and canonical skill codes. The approved target keeps the stable `/users/me/profile` resource but replaces student-only fields with contributor background, specialization and canonical skills; education becomes a separate child collection rather than a single school field.

The target contract will add private CV upload/status/replace operations under `/api/v1/users/me/cv` and an application-readiness representation derived from account, profile and CV state. Contributors may browse projects while incomplete; `POST /applications` remains the authoritative enforcement point. A `READY` CV indicates only successful technical/security validation, not verified content. Exact multipart/presigned-upload details remain blocked by OQ-07 and must be added to OpenAPI when object storage is selected.

Education is a child collection of the contributor profile. The target contract uses `GET` and `POST /api/v1/users/me/education`, plus `PUT` and `DELETE /api/v1/users/me/education/{educationId}`. Requests carry institution, field of study, education level, optional degree name, start/end period, education status and optional description. The API validates ownership and consistent periods/statuses; responses identify entries as self-declared. Education is not included in the application-readiness predicates.

## Project complexity and budget target

The project create/update contract includes `complexity` with one of `BASIC`, `MEDIUM`, or `HIGH`. The backend also exposes the current project-creation policy (allowed levels, global budget range, and minimum budget for each level) so the generated frontend client can render the same policy without hard-coded business constants.

Submitting a draft whose budget is below the selected level's minimum returns HTTP `422` with stable code `PROJECT_BUDGET_BELOW_COMPLEXITY_MINIMUM` and details containing `complexity`, `minimumBudget`, and `submittedBudget`. The backend repeats this validation before publication even if the draft was created under an older client session.

When admin review identifies a scope that is materially more complex than its declared level, the moderation command returns the project to `DRAFT` and requires a reason; it may also include `suggestedComplexity`. This is a review decision, not an admin-side edit of the SME's project. The exact project-creation-policy resource shape and the numeric minimums are finalized with OQ-08 when this slice is implemented and then committed to OpenAPI together with generated clients.

## Compatibility

Preserve current routes/statuses/semantics. Prefer additive fields. Renames/removals/semantic changes require an ADR and versioning decision. Generated artifacts must reproduce in CI; Java source models are not shared with TypeScript.

