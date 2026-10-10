# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS development
WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
COPY packages ./packages
COPY apps/web ./apps/web
WORKDIR /workspace/apps/web
EXPOSE 3000
CMD ["pnpm", "dev", "--hostname", "0.0.0.0"]
