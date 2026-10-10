---
name: nextjs-frontend
description: Implement SkillBridge frontend features in Next.js with accessible feature-oriented components and generated API contracts.
---

Read `docs/architecture.md`, `docs/api-conventions.md`, and `docs/frontend-conventions.md`. Organize code by feature, use server components by default, and make client boundaries explicit. Use the generated API client rather than hand-written response shapes. Implement loading, empty, error, permission, and success states. Keep authorization decisions on the API and add a user-visible state for rejected actions.

