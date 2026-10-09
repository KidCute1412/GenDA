# Authorization Matrix

Authentication proves identity; the application use case must still verify role, ownership, eligibility, and current state. Actor role, account state and email OTP verification are implemented; registration grants no session and the student-verification gate is removed. Contributor readiness and the remaining target gates are not yet implemented.

| Use case | Contributor | SME | Admin |
|---|---:|---:|---:|
| Verify own registration email by OTP | Own pending account | Own pending account | No |
| View published `GENERAL` projects | Yes, after email verification | Yes, after email verification and business approval | Yes |
| View own business-verification result | No | Own pending/decided registration | No |
| Create/edit own draft project | No | Yes, only when business `VERIFIED` | Support/audit only |
| Upload/replace own CV (PDF) | Own account | No | No content approval |
| Create/update/delete education entries | Own account only | No | Support/audit only |
| Submit application | Yes, only when general eligibility passes | No | No |
| Review applicants/CVs for own project | No | Yes | Audit/support |
| Approve or reject project | No | No | Yes |
| Review project scope against declared complexity | No | Respond by editing own returned draft | Yes; return mismatch to draft with reason and suggested level |
| Review SME business verification | No | No | Yes |
| Manage milestones for assigned project | As assigned | As owner | Support/audit |
| Accept deliverable | No | As project owner | Support/audit |

## Enforcement rules

- Registration does not grant a full authenticated session. A valid one-time OTP must verify the registered email first.
- Guards reject unauthenticated requests and coarse role mismatches.
- Use cases enforce ownership, assignment, eligibility, and state-transition rules. A frontend checklist is UX only.
- The `projects` use case enforces the server-owned budget range of the selected level at submission and publication. Admin review checks whether scope is materially under-classified; admin returns the project to its SME instead of directly editing it.
- General-project application requires an active account, verified email, complete contributor profile, and a `READY` CV.
- Self-applying additionally requires the tier for the project level: `BASIC` any tier, `MEDIUM` from SILVER (or an owning SME's invitation), `HIGH` GOLD only. Implemented: `/api/v1/users/me/{profile,education,cv,readiness,experience}` are `CONTRIBUTOR`-only and act on the caller's own data; the CV file is served only to its owner. `POST /api/v1/applications` enforces the general checklist and the tier gate on the server (`422 APPLICATION_NOT_ELIGIBLE` lists what is missing). `/api/v1/applications/**` is `CONTRIBUTOR`-only and acts on the caller's own applications. `/api/v1/sme/projects/{id}/applications` and `/api/v1/sme/applications/{id}/*` are `SME`-only and reach only projects the SME owns; another SME's project or application answers `404`. The SME reads an applicant's current READY CV only through an application to its own project, and sees the contributor's email only once that application is `ACCEPTED`.
- Student background is self-declared. There is no student-evidence submission, review permission or verified-student badge.
- Education is optional self-declared profile data; its absence does not block a general-project application and it carries no verified badge.
- Email verification and SME business verification are independent. A pending or rejected SME receives no full session and cannot create a project.
- Admin support actions require an audit record with actor, target, reason, and timestamp. Project submission, publication and return are recorded in `project_moderation_events`.
- `/api/v1/sme/**` requires the `SME` role and `/api/v1/admin/**` the `ADMIN` role at the HTTP layer; the project use cases re-check that the SME is still active and approved, or that the admin is active.
- A frontend permission check improves UX but never replaces API authorization.
- CV and credential files are private; access is granted only to the owner and actors with a current business need.
