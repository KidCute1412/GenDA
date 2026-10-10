# GenDA / SkillBridge

Next.js frontend, Spring Boot modular monolith, PostgreSQL.

Install Docker Desktop (Linux containers, Compose 5.0.2+) and Windows Terminal, then run `start.bat`. It starts frontend/backend/database and opens two panes. UI: http://localhost:3000. API: http://localhost:3001/api/v1/health.

Closing panes leaves containers running; `stop.bat` stops them and preserves data. See [local setup](docs/local-development.md), [architecture](docs/architecture.md) and [deployment guide](docs/deployment.md) for modules, reload, migrations and Vercel/Render/Supabase setup.

Current backend: health/readiness, contributor/SME registration, email OTP verification, cookie authentication, contributor profile view/update, and read-only skill/project catalogs. CV, SME business review, applications, matching and later workflows remain unimplemented or browser demos.

Backend code lives in `apps/api/src/main/java/vn/skillbridge/<module>`, runtime configuration and Flyway migrations in `src/main/resources`, and Java tests in `src/test/java`. Each business module has `api`, `application`, `domain` and `infrastructure` layers. Read the [module interfaces and contribution rules](docs/architecture.md#published-module-interfaces) before adding cross-module calls; ArchUnit checks them during backend lint and Maven verification.

Verification with JDK 21+: from `apps/api`, run `mvnw.cmd verify` (Windows) or `sh mvnw verify` (Linux). Frontend checks use pnpm. Launch does not require host Java/Node.
