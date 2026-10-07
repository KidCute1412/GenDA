ALTER TABLE app_users
    DROP CONSTRAINT ck_app_users_role_state,
    DROP CONSTRAINT ck_app_users_registration_identity,
    ADD COLUMN account_state VARCHAR(32);

UPDATE app_users
SET account_state = CASE
    WHEN active = FALSE THEN 'DISABLED'
    WHEN email_verified = FALSE THEN 'PENDING_EMAIL_VERIFICATION'
    WHEN role = 'SME' AND sme_approval_status <> 'APPROVED' THEN 'EMAIL_VERIFIED'
    ELSE 'ACTIVE'
END,
updated_at = CURRENT_TIMESTAMP;

ALTER TABLE app_users
    ALTER COLUMN account_state SET NOT NULL,
    ADD CONSTRAINT ck_app_users_account_state CHECK (
        account_state IN ('PENDING_EMAIL_VERIFICATION', 'EMAIL_VERIFIED', 'ACTIVE', 'DISABLED')
    ),
    ADD CONSTRAINT ck_app_users_email_state CHECK (
        account_state = 'DISABLED'
        OR (account_state = 'PENDING_EMAIL_VERIFICATION' AND email_verified = FALSE)
        OR (account_state IN ('EMAIL_VERIFIED', 'ACTIVE') AND email_verified = TRUE)
    ),
    ADD CONSTRAINT ck_app_users_role_state CHECK (
        (role = 'CONTRIBUTOR' AND sme_approval_status IS NULL)
        OR (role = 'SME' AND sme_approval_status IS NOT NULL)
        OR (role = 'ADMIN' AND sme_approval_status IS NULL)
    ),
    ADD CONSTRAINT ck_app_users_registration_identity CHECK (
        (role <> 'SME' AND tax_code IS NULL AND company_website IS NULL)
        OR (role = 'SME' AND (tax_code IS NOT NULL OR company_website IS NOT NULL))
    ) NOT VALID,
    DROP COLUMN student_verification_status,
    DROP COLUMN active;
