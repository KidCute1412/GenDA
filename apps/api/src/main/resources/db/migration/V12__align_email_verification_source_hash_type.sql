ALTER TABLE auth_email_verification_challenges
    ALTER COLUMN request_source_hash TYPE VARCHAR(64);
