# SkillBridge Agent Guide

Before changing code, read `docs/architecture.md` and the relevant domain/convention docs. For features, use the `feature-workflow` skill; for architecture-sensitive work use `architecture-guardrails`.

Keep business rules in backend domain/application code, update API/schema/docs/tests together, avoid unrelated changes, and finish with `docs/definition-of-done.md`. Repository skills live in `.agents/skills` and are shared by Codex and AGY.
