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

Real backend auth is not implemented in the scaffold; browser demo sessions are not credentials. Choose identity/session contract before adding protected business endpoints. API security and use cases enforce role, ownership, assignments and lifecycle.

CORS uses exact origins. Current health requests do not use credentialed cookies; adding cookie authentication requires a reviewed CORS/CSRF/session design.

## Compatibility

Preserve current routes/statuses/semantics. Prefer additive fields. Renames/removals/semantic changes require an ADR and versioning decision. Generated artifacts must reproduce in CI; Java source models are not shared with TypeScript.

