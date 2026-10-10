# ADR 0004: Defer email verification from the MVP

Status: Accepted, 2026-10-10. Supersedes the email-verification portions of ADR 0003.

Contributor and SME accounts become active immediately after registration. Email is a sign-in identifier; registration does not send mail, and login creates the authenticated session. Disabled accounts remain blocked. Backend rate limits continue to protect registration and login.

Flyway V15 activates existing non-disabled accounts, removes the `email_verified` column, and drops OTP challenge and attempt tables. It preserves disabled users, account identity data, and historical SME approval data.

Email ownership verification, password reset, and transactional email delivery are deferred until a product need justifies their delivery and support cost.
