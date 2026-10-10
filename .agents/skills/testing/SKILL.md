---
name: testing
description: Select and implement pragmatic unit, integration, contract, and Playwright tests for SkillBridge changes.
---

Choose the lowest useful layer: unit for pure rules and transitions, integration for repositories/transactions/use cases, contract for OpenAPI/client alignment, and Playwright for critical user journeys. Use deterministic isolated fixtures. Every changed authorization rule and state transition needs a positive and negative case. Add regression coverage for bugs and report untestable behavior instead of weakening assertions.

