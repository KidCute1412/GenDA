ALTER TABLE app_users
    DROP CONSTRAINT ck_app_users_role_state,
    DROP CONSTRAINT app_users_role_check;

UPDATE app_users
SET role = 'CONTRIBUTOR',
    updated_at = CURRENT_TIMESTAMP
WHERE role = 'STUDENT';

ALTER TABLE app_users
    ADD CONSTRAINT ck_app_users_role CHECK (role IN ('CONTRIBUTOR', 'SME', 'ADMIN')),
    ADD CONSTRAINT ck_app_users_role_state CHECK (
        (role = 'CONTRIBUTOR' AND student_verification_status IS NOT NULL AND sme_approval_status IS NULL)
        OR (role = 'SME' AND student_verification_status IS NULL AND sme_approval_status IS NOT NULL)
        OR (role = 'ADMIN' AND student_verification_status IS NULL AND sme_approval_status IS NULL)
    );
