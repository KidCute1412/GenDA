package vn.skillbridge.users.domain;

import java.time.Instant;
import java.util.UUID;

/** A project the contributor completed with an accepted application and every milestone accepted. */
public record ExperienceRecord(
        UUID projectId,
        String projectTitle,
        String smeName,
        ProjectLevel level,
        Instant completedAt) {
}
