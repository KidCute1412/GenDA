---
name: requirements-spec
description: Derive, write, and maintain GenDA requirements in `docs/requirement.md` from source material in `docs/general/`, keeping every requirement identified, verifiable, prioritized, and traceable to an owning module.
---

Use this skill when the task is to elicit, specify, change, or audit requirements — before `feature-workflow` implements anything. Requirements work stops at "what and why"; it does not choose technical designs.

## Source hierarchy

`docs/general/` holds the business source material (project description, slides, reference PDFs). `docs/architecture.md`, `docs/domain-model.md`, `docs/authorization-matrix.md`, and `docs/api-conventions.md` hold the engineering source of truth.

When sources disagree: engineering docs win on technical decisions; the newest business document wins on product scope and behavior. Never silently pick a side — record the conflict under Open questions with both sources named, and flag it to the user.

## Rules for each requirement

- Give it a stable ID: `FR-<MODULE>-<nn>` for functional, `NFR-<CATEGORY>-<nn>` for non-functional. IDs are never reused or renumbered; a dropped requirement is marked removed.
- State one testable behavior, in the active voice, naming the actor. No "the system should support" without a subject and an observable outcome.
- Make it verifiable: pair it with acceptance criteria a test can assert. A requirement nobody can fail is not a requirement.
- Assign an owning module from `docs/architecture.md`. A requirement without an owner means the module list is wrong or the requirement is two requirements.
- Assign a MoSCoW priority scoped to the current release. Everything cannot be Must.
- Separate business rules (invariants that hold across use cases) from functional requirements (behavior of one use case).

## Structure of `docs/requirement.md`

Scope and release boundary → actors → functional requirements grouped by module → business rules → non-functional requirements → acceptance criteria → traceability table → out of scope → assumptions, risks, open questions.

State what is explicitly out of scope for the release. Unstated exclusions get built.

## Consistency obligations

Requirements must not contradict `docs/domain-model.md` lifecycles or `docs/authorization-matrix.md`. If a requirement needs a new status, transition, or permission, say so explicitly and list the docs that must change with it — do not smuggle a domain change in through requirement prose.

## Changing requirements

Edit the existing ID in place rather than appending a near-duplicate. When a change affects a lifecycle, permission, or API contract, note the downstream docs and the ADR that the change requires. Keep the traceability table current in the same edit; a stale traceability table is worse than none.
