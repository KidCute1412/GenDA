# API Conventions

## Contract

This repository uses NestJS code-first OpenAPI: DTO decorators and controller metadata generate the OpenAPI document. Use `openapi-typescript` plus `openapi-fetch` (or the project-approved equivalent) to generate `packages/api-client`. A contract change updates the API, generated client, and tests in the same change.

## Request and response

- Prefix every endpoint with `/api/v1`.
- Use plural resource names and HTTP semantics.
- Validate DTOs with a global validation pipe: whitelist, transform, and reject unknown fields.
- Paginated responses use `{ data, page, pageSize, total }`.
- Errors use `{ code, message, details?, requestId }`.
- Never expose Prisma models directly from controllers.
- Use explicit response DTOs and serializers; do not implicitly serialize ORM objects.

## Authentication and authorization

Authentication identifies the user; guards and application use cases authorize the action. Role checks are not a substitute for ownership checks.

## Compatibility

Additive response fields are preferred. Renames, removals, and semantic changes require an ADR and versioning decision. Do not silently change enum meanings. Generated artifacts must be reproducible in CI.

