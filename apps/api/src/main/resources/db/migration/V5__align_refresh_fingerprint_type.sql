ALTER TABLE auth_refresh_sessions
    ALTER COLUMN token_fingerprint TYPE VARCHAR(64);
