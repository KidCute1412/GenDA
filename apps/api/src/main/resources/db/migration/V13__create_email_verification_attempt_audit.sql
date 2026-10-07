CREATE TABLE auth_email_verification_attempts (
    id UUID PRIMARY KEY,
    challenge_id UUID NOT NULL REFERENCES auth_email_verification_challenges(id) ON DELETE CASCADE,
    request_source_hash VARCHAR(64) NOT NULL,
    successful BOOLEAN NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_verification_attempt_source_rate
    ON auth_email_verification_attempts (request_source_hash, attempted_at DESC)
    WHERE successful = FALSE;
