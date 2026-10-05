# Deploy: Vercel + Render + Supabase

Frontend already exists: **https://gen-da-web.lok1412.site/**. Keep this Vercel project/domain. Local setup: [local-development.md](local-development.md).

## 1. Supabase

Create/select a PostgreSQL project. In **Connect**, choose **Session pooler**, port **5432**. Copy its host, username and database password.

Use a fresh database for this scaffold; review migrations before connecting an existing populated database. Supabase REST URL/API keys are not JDBC credentials.

## 2. Render backend

Push the reviewed code and `render.yaml` to GitHub, then open:
[Create Blueprint](https://dashboard.render.com/blueprint/new?repo=https://github.com/KidCute1412/GenDA)

Review the **Free** Docker service and privately fill:
```text
SPRING_DATASOURCE_URL=jdbc:postgresql://<session-pooler-host>:5432/postgres?sslmode=require&connectTimeout=10&socketTimeout=30
SPRING_DATASOURCE_USERNAME=<session-pooler-username>
SPRING_DATASOURCE_PASSWORD=<database-password>
```

Blueprint already sets `PORT=10000`, `DB_POOL_SIZE=3`, production OpenAPI disabled, and `CORS_ALLOWED_ORIGINS=https://gen-da-web.lok1412.site`.

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
