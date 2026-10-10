# SkillBridge Domain Model

## Actors

- `STUDENT`: applies individually or as a team member and attaches a PDF CV to applications.
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

- An SME account must provide a Vietnamese tax code (10 digits, or `0123456789-001` for a branch) at registration; an SME without a tax code must provide its company website instead. Otherwise registration fails with `SME_IDENTITY_REQUIRED`.
- A newly registered SME stays `PENDING` until an admin approves it: it cannot sign in or create projects (`SME_NOT_APPROVED`). An admin may approve, or reject with a recorded reason; both decisions are audited.
- Only an SME can create or edit its draft project.
- Only an admin can publish or reject a pending project.
- A student cannot apply to an unpublished or cancelled project.
- An accepted application belongs to at most one active project assignment.
- A milestone cannot be accepted without a submitted deliverable.
- Only completed projects can receive an SME review. Verified portfolio entries were removed from scope (replaced by the student CV).
- Every acceptance and rejection records the acting user and timestamp.

