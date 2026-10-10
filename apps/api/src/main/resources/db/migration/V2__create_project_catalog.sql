CREATE TABLE skills (
    id UUID PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL UNIQUE,
    display_order INTEGER NOT NULL CHECK (display_order >= 0)
);

CREATE TABLE projects (
    id UUID PRIMARY KEY,
    public_id VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(180) NOT NULL,
    sme_name VARCHAR(180) NOT NULL,
    sme_industry VARCHAR(120) NOT NULL,
    sme_size VARCHAR(80) NOT NULL,
    sme_contact VARCHAR(180) NOT NULL,
    budget BIGINT NOT NULL CHECK (budget BETWEEN 1000000 AND 5000000),
    deadline DATE NOT NULL,
    status VARCHAR(32) NOT NULL CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    summary VARCHAR(500) NOT NULL,
    problem TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_skills (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0),
    skill_code VARCHAR(64) NOT NULL REFERENCES skills(code),
    PRIMARY KEY (project_id, position),
    UNIQUE (project_id, skill_code)
);

CREATE TABLE project_acceptance_criteria (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0),
    criterion VARCHAR(500) NOT NULL,
    PRIMARY KEY (project_id, position)
);

CREATE TABLE project_milestones (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    public_id VARCHAR(100) NOT NULL,
    position INTEGER NOT NULL CHECK (position > 0),
    title VARCHAR(180) NOT NULL,
    budget BIGINT NOT NULL CHECK (budget > 0),
    deadline DATE NOT NULL,
    status VARCHAR(32) NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'ACCEPTED', 'CHANGES_REQUESTED')),
    escrow_status VARCHAR(32) NOT NULL CHECK (escrow_status IN ('PENDING_FUNDING', 'FUNDED', 'RELEASED')),
    UNIQUE (project_id, public_id),
    UNIQUE (project_id, position)
);

CREATE TABLE project_milestone_criteria (
    milestone_id UUID NOT NULL REFERENCES project_milestones(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0),
    criterion VARCHAR(500) NOT NULL,
    PRIMARY KEY (milestone_id, position)
);

CREATE INDEX idx_projects_public_catalog ON projects (status, deadline, created_at DESC);
CREATE INDEX idx_projects_budget ON projects (budget);
CREATE INDEX idx_project_skills_code ON project_skills (skill_code, project_id);

INSERT INTO skills (id, code, name, display_order) VALUES
    ('10000000-0000-0000-0000-000000000001', 'react', 'React', 10),
    ('10000000-0000-0000-0000-000000000002', 'nextjs', 'Next.js', 20),
    ('10000000-0000-0000-0000-000000000003', 'typescript', 'TypeScript', 30),
    ('10000000-0000-0000-0000-000000000004', 'figma', 'Figma', 40),
    ('10000000-0000-0000-0000-000000000005', 'ui-ux', 'UI/UX', 50),
    ('10000000-0000-0000-0000-000000000006', 'content-marketing', 'Content Marketing', 60),
    ('10000000-0000-0000-0000-000000000007', 'seo', 'SEO', 70),
    ('10000000-0000-0000-0000-000000000008', 'copywriting', 'Copywriting', 80),
    ('10000000-0000-0000-0000-000000000009', 'graphic-design', 'Thiết kế đồ họa', 90),
    ('10000000-0000-0000-0000-000000000010', 'video-editing', 'Dựng video', 100),
    ('10000000-0000-0000-0000-000000000011', 'meta-ads', 'Quảng cáo Meta', 110),
    ('10000000-0000-0000-0000-000000000012', 'python', 'Python', 120);
