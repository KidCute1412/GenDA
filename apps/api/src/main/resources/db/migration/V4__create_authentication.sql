CREATE TABLE app_users (
    id UUID PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE CHECK (email = LOWER(email)),
    password_hash VARCHAR(100) NOT NULL,
    display_name VARCHAR(180) NOT NULL,
    role VARCHAR(16) NOT NULL CHECK (role IN ('STUDENT', 'SME', 'ADMIN')),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    student_verification_status VARCHAR(16) CHECK (student_verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED')),
    sme_approval_status VARCHAR(16) CHECK (sme_approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_app_users_role_state CHECK (
        (role = 'STUDENT' AND student_verification_status IS NOT NULL AND sme_approval_status IS NULL)
        OR (role = 'SME' AND student_verification_status IS NULL AND sme_approval_status IS NOT NULL)
        OR (role = 'ADMIN' AND student_verification_status IS NULL AND sme_approval_status IS NULL)
    )
);

CREATE TABLE auth_refresh_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    token_fingerprint CHAR(64) NOT NULL UNIQUE,
    remember_device BOOLEAN NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auth_refresh_sessions_user_active
    ON auth_refresh_sessions (user_id, expires_at)
    WHERE revoked_at IS NULL;
