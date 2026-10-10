package vn.skillbridge.milestones.domain;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record Handoff(UUID id, UUID milestoneId, int revision, UUID actorId, String note, List<String> links,
        Instant submittedAt, String decision, String reason, UUID decidedBy, Instant decidedAt) {
    public Handoff { links = List.copyOf(links); }
    public Handoff decide(boolean accepted, String reason, UUID actor, Instant now) {
        if (decision != null) throw new MilestoneViolation("MILESTONE_CONFLICT", "Revision already reviewed");
        return new Handoff(id, milestoneId, revision, actorId, note, links, submittedAt,
                accepted ? "ACCEPTED" : "CHANGES_REQUESTED", reason, actor, now);
    }
}
