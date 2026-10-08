# Deploy: Vercel + Render + Supabase

Frontend already exists: **https://gen-da-web.lok1412.site/**. Keep this Vercel project/domain. Local setup: [local-development.md](local-development.md).

## 1. Supabase

Create/select a PostgreSQL project. In **Connect**, choose **Session pooler**, port **5432**, then **JDBC**. Copy the full connection string, including username and database password, into `SPRING_DATASOURCE_URL` on Render. Percent-encode reserved characters in the password (for example, `&` becomes `%26` and `#` becomes `%23`). No separate database username/password variables are required.

Use a fresh database for this scaffold; review migrations before connecting an existing populated database. Supabase REST URL/API keys are not JDBC credentials.

## 2. Render backend

Push the reviewed code and `render.yaml` to GitHub, then open:
[Create Blueprint](https://dashboard.render.com/blueprint/new?repo=https://github.com/KidCute1412/GenDA)

Review the **Free** Docker service and privately fill:
```text
SPRING_DATASOURCE_URL=jdbc:postgresql://<session-pooler-host>:5432/postgres?user=postgres.<project-ref>&password=<url-encoded-database-password>&sslmode=require&connectTimeout=10&socketTimeout=30
AUTH_JWT_SECRET=<at-least-32-random-bytes>
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USERNAME=<smtp-username>
SMTP_PASSWORD=<smtp-password>
SMTP_AUTH=true
SMTP_STARTTLS=true
AUTH_EMAIL_FROM=no-reply@your-domain.example
```

Blueprint sets `PORT=10000`, `DB_POOL_SIZE=3`, production OpenAPI disabled, exact CORS origin, a generated JWT secret, and secure `SameSite=None` auth cookies. Prefer a custom API subdomain under the same parent site when available so browser privacy controls do not treat authentication cookies as third-party cookies.

For an existing Render service, replace `SPRING_DATASOURCE_URL` with the full JDBC string and remove the old `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD` variables. Local Compose still supplies its database credentials automatically from root `.env`; `start.bat` needs no hosted connection string.

Apply and wait for **Live**. Open `https://<service>.onrender.com/api/v1/health`; expect `{ "status": "ok", "service": "genda-api" }`.

Flyway runs automatically before startup; Hibernate validates schema. Backend needs reachable database credentials to start. The Docker image is locally verified; a live hosted deployment has not been performed in this change.

## 3. Existing Vercel project

Set environment variables, then redeploy:
```text
NEXT_PUBLIC_API_URL=https://<service>.onrender.com
API_INTERNAL_URL=https://<service>.onrender.com
```

Project root: `apps/web`; Node 22; enable workspace sources outside the root. Checked-in `vercel.json` supplies pnpm install/build commands. Never put database credentials in Vercel.

## 4. Verify

- Backend health and `https://gen-da-web.lok1412.site/api/health` return 200.
- Test the existing demo navigation.
- Add any actual preview origins explicitly to CORS; no trailing slash or wildcard.
- Wake/test Render Free before presenting because it sleeps when idle.

UI workflows remain browser demos until business APIs are implemented. Migrations create schema, not a copy of local records. For failure, inspect Render logs; fix migration/connectivity rather than deleting history. Roll back code only if compatible with applied schema.
