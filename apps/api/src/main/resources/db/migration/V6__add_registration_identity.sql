ALTER TABLE app_users
    ADD COLUMN tax_code VARCHAR(14),
    ADD COLUMN company_website VARCHAR(512);

ALTER TABLE app_users
    ADD CONSTRAINT ck_app_users_registration_identity CHECK (
        (role <> 'SME' AND tax_code IS NULL AND company_website IS NULL)
        OR (role = 'SME' AND (tax_code IS NOT NULL OR company_website IS NOT NULL))
    ) NOT VALID,
    ADD CONSTRAINT ck_app_users_tax_code_format CHECK (
        tax_code IS NULL OR tax_code ~ '^[0-9]{10}(-[0-9]{3})?$'
    ) NOT VALID;
