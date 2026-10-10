---
name: architecture-guardrails
description: Check or implement SkillBridge changes while enforcing modular-monolith module boundaries and dependency direction.
---

Before editing, identify the owning business module and its public interface. Keep the dependency direction `controller → application → domain → repository interface → infrastructure`. Do not import Prisma or HTTP concerns into domain code, and do not reach into another module's private repository. Flag boundary violations and propose the smallest compliant design. Verify changed imports and tests before finishing.

