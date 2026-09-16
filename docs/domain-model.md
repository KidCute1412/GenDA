# SkillBridge Domain Model

## Actors

- `STUDENT`: applies individually or as a team member and owns portfolio evidence.
- `SME`: creates projects, selects applicants, defines milestones, and accepts deliverables.
- `ADMIN`: moderates projects, supports disputes, and audits state changes.

## Core lifecycle

```text
Project: DRAFT → PENDING_REVIEW → PUBLISHED → IN_PROGRESS
       → SUBMITTED → COMPLETED / CANCELLED
Application: SUBMITTED → SHORTLISTED → ACCEPTED / REJECTED / WITHDRAWN
Milestone: PENDING → IN_PROGRESS → SUBMITTED → ACCEPTED / CHANGES_REQUESTED
```

Only the owning use case may perform a transition. Invalid transitions return a stable domain error.

## MVP invariants

- Only an SME can create or edit its draft project.
- Only an admin can publish or reject a pending project.
- A student cannot apply to an unpublished or cancelled project.
- An accepted application belongs to at most one active project assignment.
- A milestone cannot be accepted without a submitted deliverable.
- Only completed projects create verified portfolio entries or certificates.
- Every acceptance and rejection records the acting user and timestamp.

