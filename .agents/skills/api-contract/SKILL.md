---
name: api-contract
description: Define or change SkillBridge REST APIs using the OpenAPI contract and generated frontend client workflow.
---

Read `docs/api-conventions.md`. This repository uses NestJS code-first OpenAPI: define DTO decorators and controller metadata, generate the OpenAPI document, then regenerate `packages/api-client` with the approved generator. Define validation, status codes, error codes, pagination, and authorization behavior before implementation. Avoid leaking persistence models. Add contract tests and identify breaking changes explicitly.

