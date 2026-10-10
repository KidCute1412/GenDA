---
name: feature-workflow
description: Deliver a SkillBridge feature from requirement to verified vertical slice across Next.js, NestJS, Prisma, tests, and documentation.
---

Start by reading `AGENTS.md`, the project context, relevant domain rules, and the authorization matrix. Identify the owning module, affected API contract, data changes, UI states, authorization matrix, and acceptance criteria. Implement the smallest vertical slice in dependency order: domain/use case, persistence, API contract/client generation, frontend, then tests. Keep the change reviewable, update docs for decisions, and finish with lint, typecheck, tests, build, and the definition-of-done checklist.
