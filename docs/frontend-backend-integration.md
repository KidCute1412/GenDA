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
- the apply action and application lifecycle;
- SME/admin/workspace workflows.

These values never grant backend authorization. Do not send them as trusted role, ownership or verification facts.

## Local seed boundary

`compose.yaml` activates Spring profile `demo`. After Flyway finishes the versioned schema migrations, a profile-scoped startup runner executes the idempotent catalog seed. The seed is deliberately absent from Flyway schema history. Deployment environments do not activate `demo`, so production receives the canonical skill reference data but no sample projects.

## Authentication boundary

The login and registration UI use the generated client with `credentials: include`. JavaScript receives the authenticated user DTO; JWTs remain in `HttpOnly` cookies. Registration creates an active Contributor or SME without email verification and redirects to sign-in.

After login, the frontend calls `/auth/me`; an expired access cookie triggers one `/auth/refresh` rotation before retrying. Backend account and role use cases remain authoritative.
