# GenDA / SkillBridge

Next.js frontend, Spring Boot modular monolith, PostgreSQL.

Install Docker Desktop (Linux containers, Compose 5.0.2+) and Windows Terminal, then run `start.bat`. It starts frontend/backend/database and opens two panes. UI: http://localhost:3000. API: http://localhost:3001/api/v1/health.

Closing panes leaves containers running; `stop.bat` stops them and preserves data. See [local setup](docs/local-development.md), [architecture](docs/architecture.md) and [deployment guide](docs/deployment.md) for modules, reload, migrations and Vercel/Render/Supabase setup.

Current backend: health/readiness only. Frontend business flows remain sample-data/localStorage demos; real auth and business APIs are not implemented yet.

Verification with JDK 21+: from `apps/api`, run `mvnw.cmd verify` (Windows) or `sh mvnw verify` (Linux). Frontend checks use pnpm. Launch does not require host Java/Node.
