CREATE TABLE student_profiles (
    user_id UUID PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
    school VARCHAR(180) NOT NULL,
    major VARCHAR(180) NOT NULL,
    study_year VARCHAR(24) NOT NULL CHECK (
        study_year IN ('YEAR_1', 'YEAR_2', 'YEAR_3', 'YEAR_4', 'RECENT_GRADUATE')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_profile_skills (
    user_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    position SMALLINT NOT NULL CHECK (position BETWEEN 0 AND 7),
    skill_code VARCHAR(64) NOT NULL REFERENCES skills(code),
    PRIMARY KEY (user_id, skill_code),
    CONSTRAINT uq_student_profile_skill_position UNIQUE (user_id, position)
);

CREATE INDEX idx_student_profile_skills_code ON student_profile_skills (skill_code, user_id);
