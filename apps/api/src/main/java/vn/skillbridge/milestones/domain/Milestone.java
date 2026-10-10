package vn.skillbridge.milestones.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record Milestone(UUID id, String projectId, String planId, int order, String title, long budget,
        LocalDate deadline, List<Criterion> criteria, Status status, Funding funding, int revision) {
    public enum Status { PENDING, IN_PROGRESS, SUBMITTED, ACCEPTED, CHANGES_REQUESTED }
    public enum Funding { PENDING_FUNDING, FUNDED, RELEASED }
    public record Criterion(String id, String text) {}
    public Milestone { criteria = List.copyOf(criteria); }
    public Milestone submit(int expectedRevision) {
        if (revision != expectedRevision || (status != Status.IN_PROGRESS && status != Status.CHANGES_REQUESTED))
            throw new MilestoneViolation("MILESTONE_CONFLICT", "Milestone changed; reload before submitting");
        return copy(Status.SUBMITTED, funding, revision + 1);
    }
    public Milestone decide(int submittedRevision, boolean accepted, String reason) {
        if (status != Status.SUBMITTED || revision != submittedRevision)
            throw new MilestoneViolation("MILESTONE_CONFLICT", "Only the current submitted revision can be reviewed");
        if (!accepted && (reason == null || reason.isBlank()))
            throw new MilestoneViolation("REASON_REQUIRED", "A reason is required when requesting changes");
        return copy(accepted ? Status.ACCEPTED : Status.CHANGES_REQUESTED, funding, revision);
    }
    public Milestone start() {
        if (status != Status.PENDING) throw new MilestoneViolation("MILESTONE_CONFLICT", "Milestone already started");
        return copy(Status.IN_PROGRESS, funding, revision);
    }
    public Milestone fund(Funding target) {
        if (!(funding == Funding.PENDING_FUNDING && target == Funding.FUNDED)
                && !(funding == Funding.FUNDED && target == Funding.RELEASED && status == Status.ACCEPTED))
            throw new MilestoneViolation("MILESTONE_CONFLICT", "Invalid simulated funding transition");
        return copy(status, target, revision);
    }
    private Milestone copy(Status s, Funding f, int r) { return new Milestone(id, projectId, planId, order, title, budget, deadline, criteria, s, f, r); }
}
