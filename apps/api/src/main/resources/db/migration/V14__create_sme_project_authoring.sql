-- SME project authoring: owned drafts, project level, review submission and moderation audit.

ALTER TABLE projects
    ADD COLUMN owner_id UUID REFERENCES app_users(id),
    ADD COLUMN complexity VARCHAR(16) CHECK (complexity IN ('BASIC', 'MEDIUM', 'HIGH')),
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN submitted_at TIMESTAMPTZ,
    ADD COLUMN published_at TIMESTAMPTZ;

-- Catalog rows created before project levels existed get the level whose budget range contains them.
UPDATE projects
SET complexity = CASE
        WHEN budget <= 1500000 THEN 'BASIC'
        WHEN budget <= 3500000 THEN 'MEDIUM'
        ELSE 'HIGH'
    END,
    published_at = CASE WHEN status = 'PUBLISHED' THEN created_at END;

-- A draft may be incomplete while the SME edits it; every later state must carry the full scope.
ALTER TABLE projects
    ALTER COLUMN budget DROP NOT NULL,
    ALTER COLUMN deadline DROP NOT NULL,
    ALTER COLUMN summary DROP NOT NULL,
    ALTER COLUMN problem DROP NOT NULL,
    ALTER COLUMN sme_industry DROP NOT NULL,
    ALTER COLUMN sme_size DROP NOT NULL,
    ADD CONSTRAINT ck_projects_complete_after_draft CHECK (
        status = 'DRAFT'
        OR (complexity IS NOT NULL AND budget IS NOT NULL AND deadline IS NOT NULL
            AND summary IS NOT NULL AND problem IS NOT NULL
            AND sme_industry IS NOT NULL AND sme_size IS NOT NULL)
    );

CREATE INDEX idx_projects_owner ON projects (owner_id, updated_at DESC) WHERE owner_id IS NOT NULL;
CREATE INDEX idx_projects_review_queue ON projects (submitted_at) WHERE status = 'PENDING_REVIEW';

-- Draft milestone rows may still be missing a title or deadline; submission validates them.
ALTER TABLE project_milestone_plans
    ALTER COLUMN title DROP NOT NULL,
    ALTER COLUMN deadline DROP NOT NULL,
    DROP CONSTRAINT project_milestones_budget_check,
    ADD CONSTRAINT ck_project_milestone_plans_budget CHECK (budget >= 0);

CREATE TABLE project_moderation_events (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES app_users(id),
    action VARCHAR(16) NOT NULL CHECK (action IN ('SUBMITTED', 'PUBLISHED', 'RETURNED')),
    reason VARCHAR(1000),
    suggested_complexity VARCHAR(16) CHECK (suggested_complexity IN ('BASIC', 'MEDIUM', 'HIGH')),
    occurred_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT ck_project_moderation_events_return_reason CHECK (
        action <> 'RETURNED' OR (reason IS NOT NULL AND length(btrim(reason)) > 0)
    ),
    CONSTRAINT ck_project_moderation_events_suggestion CHECK (
        action = 'RETURNED' OR suggested_complexity IS NULL
    )
);

CREATE INDEX idx_project_moderation_events_project ON project_moderation_events (project_id, occurred_at DESC);
