# Authorization Matrix

Authentication proves identity; the application use case must still verify role, ownership, and current state.

| Use case | Student | SME | Admin |
|---|---:|---:|---:|
| View published projects | Yes | Yes | Yes |
| Create/edit own draft project | No | Yes | Support/audit only |
| Submit application | Yes | No | No |
| Review applicants for own project | No | Yes | Audit/support |
| Approve or reject project | No | No | Yes |
| Manage milestones for assigned project | As assigned | As owner | Support/audit |
| Accept deliverable | No | As project owner | Support/audit |
| Create verified portfolio/certificate | From completed work | No | System/admin workflow |

## Enforcement rules

- Guards reject unauthenticated requests and coarse role mismatches.
- Use cases enforce ownership, assignment, and state-transition rules.
- Admin support actions require an audit record with actor, target, reason, and timestamp.
- A frontend permission check improves UX but never replaces API authorization.
