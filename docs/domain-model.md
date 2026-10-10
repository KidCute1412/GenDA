# SkillBridge Domain Model

## Implementation status

This document describes the approved target domain. The current code still uses `STUDENT` and `student_profiles`; migration to `CONTRIBUTOR` must be delivered as a coordinated code, data, API-client, route and test change.

## Actors

- `CONTRIBUTOR`: an individual who applies with a PDF CV and performs a project. Student status is optional background information, not the platform role.
- `SME`: creates projects, selects applicants, defines milestones, and accepts deliverables.
- `ADMIN`: moderates projects, verifies SME business profiles, supports disputes, and audits state changes.

## Account and onboarding lifecycle

```text
Contributor account: PENDING_EMAIL_VERIFICATION --valid OTP--> ACTIVE
SME email:           PENDING_EMAIL_VERIFICATION --valid OTP--> EMAIL_VERIFIED
CV:           UPLOADING → PROCESSING → READY / REJECTED_TECHNICAL
SME business verification: PENDING → VERIFIED / REJECTED
```

Email OTP verification proves control of the registered mailbox; it does not prove current enrollment or professional competence. GenDA has no student-verification lifecycle in the approved target.

SME access is derived from an active account, verified email and `VERIFIED` business verification. Email verification and business verification are separate facts; project review remains a separate lifecycle again.

General-project eligibility is derived at request time, never stored as an independent mutable flag:

```text
canApplyGeneral = accountActive
               && emailVerified
               && contributorProfileComplete
               && cv.status == READY
```

A contributor may browse published `GENERAL` projects before the profile/CV checklist is complete. The backend enforces the checklist when an application is submitted.

## Education profile

A contributor owns zero or more education entries. Each entry records institution, field of study, education level, optional degree name, start/end period, status (`CURRENTLY_STUDYING`, `GRADUATED`, `COMPLETED`, `NOT_COMPLETED`) and an optional description.

`GRADUATED` asserts that the stated degree was awarded. `COMPLETED` records completion without asserting that degree, while `NOT_COMPLETED` records prior attendance without completion. `CURRENTLY_STUDYING` may carry an expected end period rather than an actual completion date.

Education is self-declared profile data in MVP. A future `EDUCATION_CREDENTIAL` could verify a degree or completion document, but current enrollment is not verified. Having no education entry does not make a contributor profile incomplete and does not affect `canApplyGeneral`.

## Core lifecycle

```text
Project: DRAFT → PENDING_REVIEW → PUBLISHED → IN_PROGRESS
       → SUBMITTED → COMPLETED / CANCELLED
Application: SUBMITTED → SHORTLISTED → ACCEPTED / REJECTED / WITHDRAWN
Milestone: PENDING → IN_PROGRESS → SUBMITTED → ACCEPTED / CHANGES_REQUESTED
```

Only the owning use case may perform a transition. Invalid transitions return a stable domain error.

## Project complexity and budget guard

Every project declares one complexity level: `BASIC`, `MEDIUM`, or `HIGH`. The `projects` domain owns the mapping from each level to its minimum budget, with the invariant `BASIC_MIN < MEDIUM_MIN < HIGH_MIN`. Exact amounts remain a product-policy decision (OQ-08); every configured minimum must remain within the MVP project range of 1,000,000-5,000,000 VND.

A draft may be incomplete while the SME is editing it. The transition from `DRAFT` to `PENDING_REVIEW`, and the admin transition from `PENDING_REVIEW` to `PUBLISHED`, must both revalidate `budget >= minimumBudget(complexity)`.

The numeric rule alone cannot prevent an SME from declaring a complex scope as `BASIC`. During review, the admin compares the selected complexity with scope, deliverables, required skills, deadline, and milestones. A materially under-classified project is returned to `DRAFT` with a mandatory reason and suggested complexity. The admin does not silently rewrite the SME's project; the SME must reduce the scope or select the appropriate level and budget before resubmitting.

## CV trust boundary

- Automated validation checks that the upload is a real, readable, non-password-protected PDF within 2 MB and passes the configured security scan.
- `READY` means the artifact is technically usable and safe enough to serve; it does not mean GenDA verified claims, experience, education or skills.
- Admin does not review CV content as an application prerequisite. The SME reviews the CV in the context of each application.
- AI extraction, scoring or approval is outside MVP and must never become the sole hard gate if later introduced.

## MVP invariants

- An SME account must provide a Vietnamese tax code (10 digits, or `0123456789-001` for a branch) at registration; an SME without a tax code must provide its company website instead. Otherwise registration fails with `SME_IDENTITY_REQUIRED`.
- A newly registered SME submits business identity data during registration. After its email is verified, business verification enters `PENDING` until an admin approves it; email verification does not bypass SME approval.
- An SME cannot receive a full session or create projects until both email and business verification succeed (`SME_NOT_APPROVED`). An admin may approve, or reject with a required recorded reason; both decisions are audited.
- Only an SME can create or edit its draft project.
- Only an admin can publish or reject a pending project.
- A project cannot enter `PENDING_REVIEW` or `PUBLISHED` when its budget is below the server-owned minimum for its selected complexity.
- An admin cannot publish a materially under-classified project and cannot change the SME's complexity, scope, or budget on the SME's behalf.
- A contributor cannot apply to an unpublished or cancelled project, or without satisfying `canApplyGeneral`.
- A contributor may mutate only their own education entries. Self-declared education must not be represented as verified education.
- An accepted application belongs to at most one active project assignment.
- A milestone cannot be accepted without a submitted deliverable.
- Only completed projects can receive an SME review. Verified portfolio entries remain outside scope.
- Every acceptance and rejection records the acting user and timestamp.

