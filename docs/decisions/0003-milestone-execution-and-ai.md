# ADR 0003: Milestone execution, private delivery and Gemini review

Status: Accepted, 2026-10-10.

## Decision

- Applications acceptance starts the project and initializes immutable milestone/criterion snapshots in one transaction. Milestones depend on the published projects execution facade; projects never calls back into milestones.
- Milestones execute sequentially. Accepting the final submitted milestone completes the project, resolving OQ-03 without project-level SUBMITTED.
- Deliverables use private Supabase Storage with backend authorization and HTTP upload/download. PostgreSQL contains metadata/object keys. This resolves OQ-07 for milestone files; existing CV persistence is unchanged.
- Accept notes, HTTP/HTTPS links, PDF and UTF-8 TXT. AI reads note/extracted text; no URL fetch, OCR, DOCX, image/vision or executable archive support.
- One Gemini adapter with structured JSON, default gemini-3.5-flash-lite. Gemini key is optional at startup. One successful report per revision is reused; failed attempts stay auditable and allow explicit retry.
- The user explicitly requests analysis by clicking a button with nearby data-sharing copy. No separate consent checkbox, confirmation dialog or requirement for both participants to approve is introduced, as requested by the product owner.
- AI cannot accept, reject, change criteria or change simulated payment. Both participants see the same persisted report and can record their own helpful/unhelpful feedback.

## Consequences

Storage needs its own URL/key/bucket before file uploads work; a Gemini key alone does not provision storage. Live provider quota, account data terms and output quality require verification after credentials are supplied. The normal milestone workflow remains available without Gemini.

This slice ends at project completion. SME project ratings, experience ledger completion writes and hosted deployment acceptance remain separate work. Do not advertise completed projects in this slice as already earning XP.
