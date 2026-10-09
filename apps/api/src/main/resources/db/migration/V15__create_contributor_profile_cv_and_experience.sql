-- Contributor profile per the approved model: self-declared background, specialization and canonical
-- skills; a separate education history; the private CV; and the experience ledger that XP and tier derive from.

ALTER TABLE student_profiles RENAME TO contributor_profiles;
ALTER TABLE student_profile_skills RENAME TO contributor_profile_skills;
ALTER INDEX idx_student_profile_skills_code RENAME TO idx_contributor_profile_skills_code;
ALTER TABLE contributor_profile_skills RENAME CONSTRAINT uq_student_profile_skill_position
    TO uq_contributor_profile_skill_position;

ALTER TABLE contributor_profiles
    ADD COLUMN background_type VARCHAR(32) CHECK (background_type IN (
        'STUDENT', 'RECENT_GRADUATE', 'WORKING_PROFESSIONAL', 'FREELANCER', 'CAREER_SWITCHER', 'OTHER')),
    ADD COLUMN specialization VARCHAR(180);

CREATE TABLE contributor_education (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    institution VARCHAR(180) NOT NULL,
    field_of_study VARCHAR(180) NOT NULL,
    education_level VARCHAR(32) NOT NULL CHECK (education_level IN (
        'HIGH_SCHOOL', 'VOCATIONAL', 'COLLEGE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'SHORT_COURSE', 'OTHER')),
    degree_name VARCHAR(180),
    -- Month precision: always the first day of the month. Legacy rows may not know their period yet.
    start_month DATE CHECK (start_month IS NULL OR EXTRACT(DAY FROM start_month) = 1),
    end_month DATE CHECK (end_month IS NULL OR EXTRACT(DAY FROM end_month) = 1),
    status VARCHAR(32) NOT NULL CHECK (status IN (
        'CURRENTLY_STUDYING', 'GRADUATED', 'COMPLETED', 'NOT_COMPLETED')),
    description VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_contributor_education_period CHECK (
        start_month IS NULL OR end_month IS NULL OR end_month >= start_month)
);

CREATE INDEX idx_contributor_education_user ON contributor_education (user_id, created_at);

-- The single school/major/study-year triple becomes the first self-declared education entry.
INSERT INTO contributor_education (id, user_id, institution, field_of_study, education_level, status,
                                   created_at, updated_at)
SELECT gen_random_uuid(), user_id, school, major, 'BACHELOR',
       CASE WHEN study_year = 'RECENT_GRADUATE' THEN 'GRADUATED' ELSE 'CURRENTLY_STUDYING' END,
       created_at, updated_at
FROM contributor_profiles;

UPDATE contributor_profiles
SET background_type = CASE WHEN study_year = 'RECENT_GRADUATE' THEN 'RECENT_GRADUATE' ELSE 'STUDENT' END,
    specialization = major;

ALTER TABLE contributor_profiles
    DROP COLUMN school,
    DROP COLUMN major,
    DROP COLUMN study_year,
    ALTER COLUMN background_type SET NOT NULL,
    ALTER COLUMN specialization SET NOT NULL;

-- CV metadata. Validation is synchronous in MVP, so only accepted files are stored; a technically rejected
-- upload is reported to the contributor and never replaces the current READY CV.
CREATE TABLE contributor_cvs (
    user_id UUID PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    size_bytes INTEGER NOT NULL CHECK (size_bytes BETWEEN 1 AND 2097152),
    page_count INTEGER NOT NULL CHECK (page_count >= 1),
    sha256 VARCHAR(64) NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
    status VARCHAR(24) NOT NULL CHECK (status IN ('UPLOADING', 'PROCESSING', 'READY')),
    uploaded_at TIMESTAMPTZ NOT NULL
);

-- File bytes live apart from the metadata so listing readiness never loads the PDF. Replaced by object
-- storage once OQ-07 selects a provider.
CREATE TABLE contributor_cv_files (
    user_id UUID PRIMARY KEY REFERENCES contributor_cvs(user_id) ON DELETE CASCADE,
    content BYTEA NOT NULL
);

-- One row per project a contributor completed with an ACCEPTED application and every milestone accepted.
-- XP and tier are derived from these rows at read time; title, SME and level are snapshots of the finished
-- project so the history stays readable without reaching into the projects module.
CREATE TABLE contributor_experience_records (
    contributor_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id),
    project_title VARCHAR(180) NOT NULL,
    sme_name VARCHAR(180) NOT NULL,
    complexity VARCHAR(16) NOT NULL CHECK (complexity IN ('BASIC', 'MEDIUM', 'HIGH')),
    completed_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (contributor_id, project_id),
    -- MVP assigns exactly one contributor per project.
    CONSTRAINT uq_contributor_experience_project UNIQUE (project_id)
);

CREATE INDEX idx_contributor_experience_history ON contributor_experience_records (contributor_id, completed_at);
