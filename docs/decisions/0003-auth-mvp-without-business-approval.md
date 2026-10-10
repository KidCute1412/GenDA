# ADR 0003: Auth MVP without business approval

Status: Accepted, 2026-10-10. SME approval policy remains in force; the email-verification choice is superseded by ADR 0004.

The product owner chose an email/password flow with no SME business-approval gate. Contributor and SME both become ACTIVE after email OTP; an active SME needs no admin business approval. Submitted business identity remains self-declared. Project moderation is independent.

Password reset is deferred. Remove its UI and fake success messages. Remove CAPTCHA and demo login/registration/session behavior. Keep BCrypt, JWT HttpOnly cookies, CSRF, generated contracts and server rate limits; do not add an auth provider or dependencies.

V14 activates existing email-verified waiting SMEs, preserves disabled/unverified accounts and historical review data. V15 later activates all non-disabled accounts and removes OTP tables. Legacy approval response data is deprecated and unused. No existing accounts are deleted. Default auth/profile seeds are removed; test fixtures exist only in an isolated test database.

Rate limits are bounded process-local counters for a single API instance. Restart resets them; replicas require a shared store. Deployment must configure only trusted proxy addresses for accurate source limits. Existing access JWTs remain valid until their five-minute expiry after logout; refresh sessions are revoked.

Requirements FR-AUTH-05, FR-USR-12/13, FR-ADM-01 and BR-17 plus their acceptance criteria and owning docs are updated in place. Business verification or password reset requires a later explicit feature decision.
