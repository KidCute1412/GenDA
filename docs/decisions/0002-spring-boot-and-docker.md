# ADR 0002: Spring Boot and Docker local runtime

Status: accepted. Supersedes the stack/persistence choice of ADR 0001; modular monolith remains.

## Decision

Java 21, Spring Boot 4.0.8, Maven Wrapper 3.9.13, JPA/Hibernate, PostgreSQL, Flyway and springdoc 3.0.3 with generated TypeScript clients. One application/database, packages by business domain corresponding to frontend features.

Docker Compose runs Next.js, API and PostgreSQL locally with split terminal Watch. Vercel hosts frontend, Render hosts backend Docker, Supabase hosts PostgreSQL over JDBC.

## Rationale

The team wants practical Java experience and a deployed CV project. Existing backend was only a health scaffold: no business APIs or Prisma data need migration. Docker standardizes dependencies for three developers and provides the Render artifact.

## Consequences

No NestJS/Prisma backend remains. REST/OpenAPI is the Java/TypeScript boundary. Flyway controls schema and Hibernate validates it. Automatic backend rebuild is slower than frontend HMR; Free hosting can cold-start.

UI remains a browser demo until backend vertical slices exist. Auth provider/session contract remains a feature decision; Supabase Auth is not implied. No new business workflows, speculative tables, microservices or queues are introduced.
