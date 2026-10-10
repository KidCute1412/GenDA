ALTER TABLE app_users DROP CONSTRAINT ck_app_users_email_state;

UPDATE app_users
SET account_state = 'ACTIVE',
    updated_at = CURRENT_TIMESTAMP
WHERE account_state <> 'DISABLED';

ALTER TABLE app_users
    DROP CONSTRAINT ck_app_users_account_state,
    DROP COLUMN email_verified,
    ADD CONSTRAINT ck_app_users_account_state CHECK (account_state IN ('ACTIVE', 'DISABLED'));

DROP TABLE auth_email_verification_attempts;
DROP TABLE auth_email_verification_challenges;
