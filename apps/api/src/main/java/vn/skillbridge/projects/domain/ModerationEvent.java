package vn.skillbridge.projects.domain;

import java.time.Instant;
import java.util.UUID;

/** Audit record of a review-lifecycle step: who acted, when, and for a return the mandatory reason. */
public record ModerationEvent(
        UUID id,
        String projectId,
        UUID actorId,
        ModerationAction action,
        String reason,
        ProjectComplexity suggestedComplexity,
        Instant occurredAt) {

    public static final int MIN_RETURN_REASON_LENGTH = 10;
    public static final int MAX_RETURN_REASON_LENGTH = 1000;

    public static ModerationEvent submitted(String projectId, UUID smeId, Instant now) {
        return new ModerationEvent(UUID.randomUUID(), projectId, smeId, ModerationAction.SUBMITTED, null, null, now);
    }

    public static ModerationEvent published(String projectId, UUID adminId, Instant now) {
        return new ModerationEvent(UUID.randomUUID(), projectId, adminId, ModerationAction.PUBLISHED, null, null, now);
    }

    public static ModerationEvent returned(String projectId, UUID adminId, String reason,
            ProjectComplexity suggestedComplexity, Instant now) {
        String normalized = reason == null ? "" : reason.trim();
        if (normalized.length() < MIN_RETURN_REASON_LENGTH || normalized.length() > MAX_RETURN_REASON_LENGTH) {
            throw new ProjectRuleViolation(ProjectRuleViolation.RETURN_REASON_REQUIRED,
                    "Returning a project requires a reason of " + MIN_RETURN_REASON_LENGTH + "-"
                            + MAX_RETURN_REASON_LENGTH + " characters");
        }
        return new ModerationEvent(UUID.randomUUID(), projectId, adminId, ModerationAction.RETURNED, normalized,
                suggestedComplexity, now);
    }
}
