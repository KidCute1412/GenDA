# SkillBridge Architecture

## Stack and repository shape

SkillBridge is a TypeScript monorepo managed with pnpm and Turborepo:

```text
apps/web        Next.js frontend
apps/api        NestJS modular monolith
packages/api-client  generated API client and transport types
packages/config      shared TypeScript/ESLint/Prettier config
```

The API is a versioned REST API under `/api/v1`. NestJS decorators are the code-first contract source; OpenAPI and the client are generated from it. PostgreSQL is accessed only through Prisma repositories in `apps/api`.

## Backend module boundaries

Initial modules are `auth`, `users`, `projects`, `applications`, `matching`, `milestones`, `reviews`, `certificates`, and `admin`.

Each module owns its domain rules, application use cases, persistence adapters, and transport controllers. A module may depend on shared kernel code and another module's public application interface, but never on another module's private repository or infrastructure implementation.

The normal module shape is:

```text
<module>/
├── domain/          entities, value objects, transition rules
├── application/    use cases and ports
├── infrastructure/ Prisma adapters and external integrations
└── presentation/   controllers, DTOs, serializers
```

```text
controller → application/use-case → domain
                         ↓
                 repository interface
                         ↓
                 Prisma adapter
```

Controllers do HTTP concerns only. Domain/application code must not import NestJS decorators, Prisma types, or HTTP response objects.

## Frontend boundaries

Pages and route handlers compose feature components. Feature components use generated API clients and local view state. Server/client component boundaries must be explicit. API response shapes are never hand-written in a component.

## Cross-cutting rules

- Validate input at the API boundary and at important domain transitions.
- Use explicit status enums and transition functions; avoid unrelated boolean flags.
- Use transactions for multi-record state transitions.
- Record actor, timestamp, and reason for admin or acceptance actions.
- Prefer observable code over premature abstraction.
- A feature is complete only when its docs, tests, typecheck, lint, and build are updated.
- Cross-module events are optional and require a real decoupling need; do not add an event bus to every workflow.

