# ADR 0001: Modular monolith for MVP

## Decision

Use a pnpm/Turborepo monorepo with Next.js web, NestJS API, and PostgreSQL/Prisma. Keep the API as a modular monolith.

## Rationale

The MVP has a small team and a workflow-heavy relational domain. Explicit module boundaries provide maintainability without the deployment and debugging cost of microservices.

## Consequences

Modules must enforce dependency boundaries in code review. A future service extraction is possible at module interfaces, but is not a current requirement.

