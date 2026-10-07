CREATE TABLE auth_email_verification_challenges (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    purpose VARCHAR(32) NOT NULL DEFAULT 'EMAIL_VERIFICATION'
        CHECK (purpose = 'EMAIL_VERIFICATION'),
    otp_hash VARCHAR(100) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    failed_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
    max_attempts INTEGER NOT NULL CHECK (max_attempts > 0),
    resend_available_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    invalidated_at TIMESTAMPTZ,
    request_source_hash CHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_email_verification_terminal_state CHECK (
        consumed_at IS NULL OR invalidated_at IS NULL
    )
);

CREATE UNIQUE INDEX uq_email_verification_current_challenge
    ON auth_email_verification_challenges (user_id, purpose)
    WHERE consumed_at IS NULL AND invalidated_at IS NULL;

CREATE INDEX idx_email_verification_source_rate
    ON auth_email_verification_challenges (request_source_hash, created_at DESC);

CREATE INDEX idx_email_verification_expiry
    ON auth_email_verification_challenges (expires_at)
    WHERE consumed_at IS NULL AND invalidated_at IS NULL;
