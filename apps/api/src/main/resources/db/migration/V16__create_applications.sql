-- Applications: a contributor applies to a PUBLISHED project; the owning SME shortlists and accepts exactly
-- one applicant, which rejects the others and starts the project in the same transaction (FR-APP-01..07).

CREATE TABLE applications (
    id UUID PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL REFERENCES projects(public_id),
    contributor_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    cover_letter VARCHAR(3000) NOT NULL CHECK (char_length(cover_letter) >= 80),
    status VARCHAR(16) NOT NULL CHECK (status IN ('SUBMITTED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
    -- SME_INVITATION is reserved for FR-APP-10/11; every application today is self-submitted.
    eligibility_source VARCHAR(16) NOT NULL CHECK (eligibility_source IN ('SELF', 'SME_INVITATION')),
    submitted_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    -- Who accepted or rejected the application and when (BR-09).
    decided_at TIMESTAMPTZ,
    decided_by UUID REFERENCES app_users(id),
    CONSTRAINT ck_applications_decision CHECK (
        (status IN ('ACCEPTED', 'REJECTED')) = (decided_at IS NOT NULL AND decided_by IS NOT NULL))
);

-- FR-APP-02: one active application per contributor and project.
CREATE UNIQUE INDEX uq_applications_active_per_contributor ON applications (project_id, contributor_id)
    WHERE status IN ('SUBMITTED', 'SHORTLISTED', 'ACCEPTED');
-- BR-05: at most one accepted application per project.
CREATE UNIQUE INDEX uq_applications_one_accepted ON applications (project_id) WHERE status = 'ACCEPTED';
CREATE INDEX idx_applications_contributor ON applications (contributor_id, submitted_at DESC);
CREATE INDEX idx_applications_project ON applications (project_id, submitted_at);

-- The accepted contributor is assigned when the project starts.
ALTER TABLE projects
    ADD COLUMN assigned_contributor_id UUID REFERENCES app_users(id),
    ADD COLUMN started_at TIMESTAMPTZ,
    ADD CONSTRAINT ck_projects_assignment CHECK (
        status <> 'IN_PROGRESS' OR (assigned_contributor_id IS NOT NULL AND started_at IS NOT NULL));
