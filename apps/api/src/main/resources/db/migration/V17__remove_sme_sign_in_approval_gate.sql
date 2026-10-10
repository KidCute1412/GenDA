-- Preserve historical review data; email verification now activates either registration role.
UPDATE app_users
SET account_state = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
WHERE role = 'SME' AND email_verified = TRUE AND account_state = 'EMAIL_VERIFIED';

ALTER TABLE app_users DROP CONSTRAINT ck_app_users_role_state;
ALTER TABLE app_users ADD CONSTRAINT ck_app_users_role_state CHECK (
    role = 'SME' OR sme_approval_status IS NULL
);
