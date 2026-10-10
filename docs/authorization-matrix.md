# Authorization Matrix

Authentication proves identity; application use cases still verify role, ownership, eligibility, and current state. Contributor and SME registrations become active immediately. Email verification and SME business approval are not sign-in gates.

| Use case | Contributor | SME | Admin |
| --- | --- | --- | --- |
| Read/update own SME profile | No | Active account, own profile only; email/registration identity read-only | No |
| Register and sign in | Own account | Own account | Internal provisioning only |
| View published projects | Yes | Yes | Yes |
| Create/edit own draft project | No | Yes | Support/audit only |
| Upload/replace own CV (PDF) | Own account | No | No content approval |
| Manage own profile and education | Own account | No | Support/audit only |
| Submit application | When profile, CV and project-level eligibility pass | No | No |
| Review applicants for own project | No | Yes | Audit/support |
| Approve or return project | No | No | Yes |
| Manage milestones for assigned project | As assigned | As owner | Support/audit |
| Accept deliverable | No | As project owner | No; simulated funding support only |
| Submit/re-submit milestone | Assigned active contributor only | No | No |
| Read workspace, submitted evidence and AI reports | Assigned active contributor only | Project owner only | No automatic content access |
| Request AI review / give feedback | Assigned active contributor | Project owner | No |
| Mark simulated milestone funding | No | Project owner | Active admin, reason and audit required |

## Enforcement rules

- Registration creates an active account and does not issue a session; the user signs in with email and password.
- Guards reject unauthenticated requests and coarse role mismatches. Use cases enforce ownership, eligibility, and state transitions.
- The projects use case enforces server-owned budget ranges and project moderation.
- Applications require an active account, complete contributor profile, a technically ready CV, and the project-level tier.
- Education is optional self-declared profile data; there is no student-evidence submission or verified-student badge.
- SME business identity is self-declared and does not block sign-in or project creation.
- Admin support actions require audit records.
- SME routes require the SME role and admin routes require the ADMIN role.
- CV and credential files are private; access is limited to the owner and actors with a current business need.
