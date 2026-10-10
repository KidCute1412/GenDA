CREATE TABLE milestones (
 id UUID PRIMARY KEY, project_id VARCHAR(100) NOT NULL REFERENCES projects(public_id),
 plan_id VARCHAR(100) NOT NULL, position INTEGER NOT NULL CHECK(position > 0),
 title VARCHAR(180) NOT NULL, budget BIGINT NOT NULL CHECK(budget > 0), deadline DATE NOT NULL,
 criteria TEXT NOT NULL, status VARCHAR(32) NOT NULL CHECK(status IN ('PENDING','IN_PROGRESS','SUBMITTED','ACCEPTED','CHANGES_REQUESTED')),
 funding VARCHAR(32) NOT NULL CHECK(funding IN ('PENDING_FUNDING','FUNDED','RELEASED')),
 revision INTEGER NOT NULL DEFAULT 0 CHECK(revision >= 0),
 UNIQUE(project_id, position), UNIQUE(project_id, plan_id)
);
CREATE TABLE handoffs (
 id UUID PRIMARY KEY, milestone_id UUID NOT NULL REFERENCES milestones(id),
 revision INTEGER NOT NULL CHECK(revision > 0), actor_id UUID NOT NULL REFERENCES app_users(id),
 note TEXT NOT NULL, links TEXT NOT NULL, submitted_at TIMESTAMPTZ NOT NULL,
 decision VARCHAR(32) CHECK(decision IN ('ACCEPTED','CHANGES_REQUESTED')),
 reason VARCHAR(2000), decided_by UUID REFERENCES app_users(id), decided_at TIMESTAMPTZ,
 UNIQUE(milestone_id, revision),
 CHECK((decision IS NULL) = (decided_by IS NULL AND decided_at IS NULL)),
 CHECK(decision <> 'CHANGES_REQUESTED' OR length(btrim(reason)) > 0)
);
CREATE TABLE handoff_attachments (
 id UUID PRIMARY KEY, milestone_id UUID NOT NULL REFERENCES milestones(id),
 handoff_id UUID REFERENCES handoffs(id), owner_id UUID NOT NULL REFERENCES app_users(id),
 name VARCHAR(180) NOT NULL, media_type VARCHAR(64) NOT NULL, size BIGINT NOT NULL CHECK(size BETWEEN 1 AND 5242880),
 object_key VARCHAR(500) NOT NULL UNIQUE, uploaded_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_handoff_attachments_revision ON handoff_attachments(handoff_id);
CREATE INDEX idx_handoff_attachments_expiry ON handoff_attachments(uploaded_at) WHERE handoff_id IS NULL;
CREATE TABLE milestone_ai_reviews (
 id UUID PRIMARY KEY, handoff_id UUID NOT NULL REFERENCES handoffs(id), requested_by UUID NOT NULL REFERENCES app_users(id),
 state VARCHAR(16) NOT NULL CHECK(state IN ('PROCESSING','SUCCEEDED','FAILED')), provider VARCHAR(32) NOT NULL,
 model VARCHAR(100) NOT NULL, prompt_version VARCHAR(32) NOT NULL, started_at TIMESTAMPTZ NOT NULL,
 finished_at TIMESTAMPTZ, report TEXT, sources TEXT NOT NULL, warnings TEXT NOT NULL, error_code VARCHAR(64),
 input_tokens BIGINT, output_tokens BIGINT
);
CREATE UNIQUE INDEX uq_milestone_ai_review_active ON milestone_ai_reviews(handoff_id) WHERE state IN ('PROCESSING','SUCCEEDED');
CREATE INDEX idx_ai_reviews_history ON milestone_ai_reviews(handoff_id,started_at DESC);
CREATE INDEX idx_ai_reviews_rate ON milestone_ai_reviews(requested_by,started_at);
CREATE TABLE milestone_ai_feedback (
 review_id UUID NOT NULL REFERENCES milestone_ai_reviews(id), actor_id UUID NOT NULL REFERENCES app_users(id),
 helpful BOOLEAN NOT NULL, updated_at TIMESTAMPTZ NOT NULL, PRIMARY KEY(review_id,actor_id)
);
CREATE TABLE milestone_events (
 id UUID PRIMARY KEY, milestone_id UUID NOT NULL REFERENCES milestones(id),
 actor_id UUID NOT NULL REFERENCES app_users(id), action VARCHAR(32) NOT NULL, reason VARCHAR(2000), occurred_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_milestone_events ON milestone_events(milestone_id,occurred_at);
-- Snapshot existing real assignments; browser demo data is never imported.
INSERT INTO milestones(id,project_id,plan_id,position,title,budget,deadline,criteria,status,funding,revision)
SELECT gen_random_uuid(), p.public_id, m.public_id, m.position, m.title, m.budget, m.deadline, '[]',
 CASE WHEN m.position = min(m.position) OVER (PARTITION BY p.id) THEN 'IN_PROGRESS' ELSE 'PENDING' END,
 'PENDING_FUNDING', 0
FROM projects p JOIN project_milestone_plans m ON m.project_id=p.id
WHERE p.status='IN_PROGRESS' AND p.assigned_contributor_id IS NOT NULL;
UPDATE milestones m SET criteria = COALESCE((
 SELECT jsonb_agg(jsonb_build_object('id',m.id::text || ':' || c.position, 'text',c.criterion) ORDER BY c.position)::text
 FROM project_milestone_plan_criteria c JOIN project_milestone_plans plan ON plan.id=c.milestone_plan_id
 JOIN projects p ON p.id=plan.project_id WHERE p.public_id=m.project_id AND plan.public_id=m.plan_id), '[]');
