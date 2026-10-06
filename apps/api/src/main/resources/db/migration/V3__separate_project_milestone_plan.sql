ALTER TABLE project_milestones RENAME TO project_milestone_plans;
ALTER TABLE project_milestone_plans DROP COLUMN status;
ALTER TABLE project_milestone_plans DROP COLUMN escrow_status;

ALTER TABLE project_milestone_criteria RENAME TO project_milestone_plan_criteria;
ALTER TABLE project_milestone_plan_criteria RENAME COLUMN milestone_id TO milestone_plan_id;
