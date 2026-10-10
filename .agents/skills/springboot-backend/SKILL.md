---
name: springboot-backend
description: Implement SkillBridge Spring Boot features with Java business-domain modular-monolith boundaries.
---

Read `docs/architecture.md`, `docs/domain-model.md`, `docs/authorization-matrix.md` and `docs/api-conventions.md`. Use Java 21, Maven Wrapper, Spring MVC and Jakarta Bean Validation. Put HTTP controllers/DTOs in `api`, use cases and transactions in `application`, framework-free rules in `domain`, JPA adapters/entities in `infrastructure`. Never serialize JPA entities or access another module's private repositories. Enforce identity, role, ownership and transitions on the API; browser demo roles are not authentication. Generate springdoc OpenAPI and the TypeScript client with contract changes. Add JUnit/MockMvc and PostgreSQL tests where needed; run `mvnw verify`. Do not invent empty modules or change auth provider implicitly.
