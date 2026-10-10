ALTER TABLE handoffs ADD CONSTRAINT ck_handoff_decision_audit CHECK (
    (decision IS NULL AND decided_by IS NULL AND decided_at IS NULL)
    OR (decision IS NOT NULL AND decided_by IS NOT NULL AND decided_at IS NOT NULL)
);
ALTER TABLE handoffs ADD CONSTRAINT ck_handoff_changes_reason CHECK (
    decision <> 'CHANGES_REQUESTED' OR (reason IS NOT NULL AND length(btrim(reason)) > 0)
);
ALTER TABLE handoffs ADD CONSTRAINT uq_handoff_milestone UNIQUE(id,milestone_id);
ALTER TABLE handoff_attachments ADD CONSTRAINT fk_attachment_handoff_milestone
    FOREIGN KEY(handoff_id,milestone_id) REFERENCES handoffs(id,milestone_id);
