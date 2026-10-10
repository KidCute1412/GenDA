# SkillBridge Domain Model

## Implementation status

This document describes the approved target domain. The account actor is `CONTRIBUTOR`; the account lifecycle is `ACTIVE` or `DISABLED`. Email verification is deferred from MVP. The legacy `student_profiles` table/name remains temporarily.

## Actors

- `CONTRIBUTOR`: an individual who applies with a PDF CV and performs a project. Student status is optional background information, not the platform role.
- `SME`: creates projects, selects applicants, defines milestones, and accepts deliverables.
- `ADMIN`: moderates projects, supports disputes, and audits state changes. Business-identity review is outside MVP.

## Account and onboarding lifecycle

```text
Contributor account: register → ACTIVE or DISABLED
SME account:         register → ACTIVE or DISABLED
CV:           UPLOADING → PROCESSING → READY / REJECTED_TECHNICAL
SME business verification: outside MVP
```

Email addresses are collected for account sign-in but are not verified in MVP.

SME access requires an active account. Business identity is self-declared; project review remains a separate lifecycle.

General-project eligibility is derived at request time, never stored as an independent mutable flag:

```text
canApplyGeneral = accountActive
               && contributorProfileComplete
               && cv.status == READY
```

A contributor may browse published `GENERAL` projects before the profile/CV checklist is complete. The backend enforces the checklist when an application is submitted.

## Contributor experience and tier

Completing an eligible project earns experience points (XP): `BASIC` +1, `MEDIUM` +2, `HIGH` +3. XP earned from `BASIC` projects counts up to 10 in total. A project counts only when it is `COMPLETED`, the contributor holds its `ACCEPTED` application and every milestone was accepted.

XP maps to a tier that bounds which project levels a contributor may apply to on their own:

```text
BRONZE  0 XP  (default)  → BASIC
SILVER  10 XP            → BASIC, MEDIUM
GOLD    30 XP            → BASIC, MEDIUM, HIGH
```

XP and tier are derived from completion history, never entered by hand or stored as an independent mutable flag. A tier never decreases in MVP. Because `BASIC` XP caps at the `SILVER` threshold, the 20 XP between `SILVER` and `GOLD` must come from `MEDIUM` work. An owning SME's invitation may waive the `SILVER` requirement for one `MEDIUM` project; nothing waives the `GOLD` requirement for `HIGH`. Tier reflects GenDA delivery history, not verified skill.

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

## Project complexity and budget range guard

Every project declares one complexity level: `BASIC`, `MEDIUM`, or `HIGH`. The `projects` domain owns the mapping from each level to an inclusive budget range (decided 2026-10-09, OQ-08):

| Level | Minimum (VND) | Maximum (VND) |
|---|---:|---:|
| `BASIC` | 1,000,000 | 1,500,000 |
| `MEDIUM` | 1,500,000 | 3,500,000 |
| `HIGH` | 3,500,000 | 5,000,000 |

The ranges are contiguous and together cover exactly the MVP project range of 1,000,000-5,000,000 VND. A boundary amount (1,500,000 or 3,500,000) is valid for both adjacent levels; the SME's chosen level decides.

A draft may be incomplete while the SME is editing it. The transition from `DRAFT` to `PENDING_REVIEW`, and the admin transition from `PENDING_REVIEW` to `PUBLISHED`, must both revalidate `minimumBudget(complexity) <= budget <= maximumBudget(complexity)`.

The numeric rule alone cannot prevent an SME from declaring a complex scope as `BASIC`. During review, the admin compares the selected complexity with scope, deliverables, required skills, deadline, and milestones. A materially under-classified project is returned to `DRAFT` with a mandatory reason and suggested complexity. The admin does not silently rewrite the SME's project; the SME must reduce the scope or select the appropriate level and budget before resubmitting.

## CV trust boundary

- Automated validation checks that the upload is a real, readable, non-password-protected PDF within 2 MB and passes the configured security scan.
- `READY` means the artifact is technically usable and safe enough to serve; it does not mean GenDA verified claims, experience, education or skills.
- Admin does not review CV content as an application prerequisite. The SME reviews the CV in the context of each application.
- AI extraction, scoring or approval is outside MVP and must never become the sole hard gate if later introduced.

## MVP invariants

- An SME account must provide a Vietnamese tax code (10 digits, or `0123456789-001` for a branch) at registration; an SME without a tax code must provide its company website instead. Otherwise registration fails with `SME_IDENTITY_REQUIRED`.
- A newly registered SME provides validated business identity and becomes ACTIVE after registration. No admin business approval is required in MVP.
- Only active accounts can receive a full session. Historical SME approval data does not affect access.
- Only an SME can create or edit its draft project.
- Only an admin can publish or reject a pending project.
- A project cannot enter `PENDING_REVIEW` or `PUBLISHED` when its budget is outside the server-owned range for its selected complexity.
- An admin cannot publish a materially under-classified project and cannot change the SME's complexity, scope, or budget on the SME's behalf.
- A contributor cannot apply to an unpublished or cancelled project, or without satisfying `canApplyGeneral`.
- A contributor may mutate only their own education entries. Self-declared education must not be represented as verified education.
- An accepted application belongs to at most one active project assignment.
- A milestone cannot be accepted without a submitted deliverable.
- Only completed projects can receive an SME review. Verified portfolio entries remain outside scope.
- Every acceptance and rejection records the acting user and timestamp.

