CREATE TABLE sme_profiles (
    user_id UUID PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
    description VARCHAR(2000),
    industry VARCHAR(120)
);
