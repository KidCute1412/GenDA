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

Authentication endpoints live under `/api/v1/auth`: `GET /csrf`, `POST /register`, `POST /login`, `POST /refresh`, `POST /logout`, and `GET /me`. Registration accepts only `STUDENT` and `SME`; students receive a session immediately while newly registered SMEs remain `PENDING` without a session until approval. Access and refresh JWTs are returned only as scoped `HttpOnly` cookies, never in JSON. Access expires after five minutes. Refresh expires after 24 hours, or seven days when `rememberDevice=true`, and rotates on use.

`POST /logout` is idempotent: it revokes the current refresh-session record when a valid refresh cookie exists, expires both authentication cookies using their original paths, and returns `204 No Content`. The access JWT remains stateless; the backend stores only the refresh-token fingerprint and revocation metadata, never the raw token.

Unsafe API requests require the `X-CSRF-Token` value issued by `GET /auth/csrf`; the browser also sends its matching CSRF cookie. Browser calls use credentials and CORS permits credentials only for exact configured origins. Production cross-site cookies require `AUTH_COOKIE_SECURE=true` and `AUTH_COOKIE_SAME_SITE=None`.

## Compatibility

Preserve current routes/statuses/semantics. Prefer additive fields. Renames/removals/semantic changes require an ADR and versioning decision. Generated artifacts must reproduce in CI; Java source models are not shared with TypeScript.

