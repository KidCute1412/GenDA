package vn.skillbridge.users.domain;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record StudentProfile(
        UUID userId,
        String school,
        String major,
        StudyYear studyYear,
        List<String> skillCodes,
        Instant createdAt,
        Instant updatedAt) {

    public StudentProfile {
        skillCodes = List.copyOf(skillCodes);
    }
}
