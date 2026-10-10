---
name: architecture-guardrails
description: Enforce Spring Boot modular-monolith boundaries and frontend business-domain ownership in SkillBridge.
---

Read `docs/architecture.md`. Identify the owning business module and public facade. Controller -> application -> domain/repository port; infrastructure implements ports. Domain imports no Spring, JPA, servlet, HTTP or infrastructure types. Application may use transaction annotations but not HTTP DTOs/infrastructure repositories. Cross-module calls use public application interfaces, never entities/repositories. Frontend audience routes compose business domains; `workspace`/`demo-ledger` are not backend domains. Verify imports and ArchUnit; add concrete cross-module tests as modules appear. Keep one application; no speculative event bus or empty scaffolding.

