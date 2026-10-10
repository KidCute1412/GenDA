# Frontend / Backend Integration Boundary

This document records the first stable vertical slice while the frontend is being refactored.

## Backend-owned data

The backend is the source of truth for:

- `GET /api/v1/skills`: canonical skill codes and display names.
- `GET /api/v1/projects`: published projects only, with keyword, repeated skill-code, budget and paging filters.
- `GET /api/v1/projects/{projectId}`: one published project, including acceptance criteria and the milestone plan visible before applying. Execution status, deliverables and escrow remain owned by the future `milestones` slice.
- The project-creation policy supplied by the backend: allowed complexity levels and the current minimum/maximum budget for each level. The wizard may display and pre-validate this policy, but must not duplicate it as trusted frontend constants.

List responses use `{ data, page, pageSize, total }`. Errors use `{ code, message, requestId }`. The OpenAPI snapshot and generated TypeScript schema are committed with contract changes.

The public project list and detail Server Components call the backend through `API_INTERNAL_URL` (falling back to `NEXT_PUBLIC_API_URL`) and opt out of static rendering. URL query parameters remain the shareable UI filter state.

## Frontend-owned temporary demo behavior

Until their backend slices exist, these behaviors stay behind the existing demo adapters:

- the current demo student's skill set and the displayed match score;
- email-verification state;
- the apply action and application lifecycle;
- SME/admin/workspace workflows.

These values never grant backend authorization. Do not send them as trusted role, ownership or verification facts.

## Local seed boundary

`compose.yaml` activates Spring profile `demo`. After Flyway finishes the versioned schema migrations, a profile-scoped startup runner executes the idempotent catalog seed. The seed is deliberately absent from Flyway schema history. Deployment environments do not activate `demo`, so production receives the canonical skill reference data but no sample projects.

## Authentication boundary

The current login and registration UI use the generated client with `credentials: include`. JavaScript receives only the authenticated user DTO; both JWTs remain in `HttpOnly` cookies. Both contributor and SME registration now create `PENDING_EMAIL_VERIFICATION` accounts without a session, and frontend session types expose `accountState`. The legacy student-verification UI/admin queue is removed. OTP confirm/resend integration remains the next implementation batch.

The approved target UI sends every new `CONTRIBUTOR` or `SME` registration to `/verify-email`, confirms a six-digit OTP through the generated client, supports cooldown-bound resend, and receives no access/refresh cookies before successful email verification. SME registration also collects the business identity required for manual review. After OTP confirmation, contributor onboarding may continue, while SME shows a pending/rejected/verified business-review result and receives no full session until `VERIFIED`. On authenticated page load, the frontend calls `/auth/me`; an expired access cookie triggers one `/auth/refresh` rotation before retrying. Frontend OTP/readiness/approval state is display state only; backend account and business use cases remain authoritative.
