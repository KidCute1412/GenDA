# Authorization Matrix

Authentication proves identity; the application use case must still verify role, ownership, eligibility, and current state. This matrix describes the approved `CONTRIBUTOR` target; current code still exposes `STUDENT` until the coordinated migration is implemented.

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
- The `projects` use case enforces the server-owned minimum budget at submission and publication. Admin review checks whether scope is materially under-classified; admin returns the project to its SME instead of directly editing it.
- General-project application requires an active account, verified email, complete contributor profile, and a `READY` CV.
- Student background is self-declared. There is no student-evidence submission, review permission or verified-student badge.
- Education is optional self-declared profile data; its absence does not block a general-project application and it carries no verified badge.
- Email verification and SME business verification are independent. A pending or rejected SME receives no full session and cannot create a project.
- Admin support actions require an audit record with actor, target, reason, and timestamp.
- A frontend permission check improves UX but never replaces API authorization.
- CV and credential files are private; access is granted only to the owner and actors with a current business need.
