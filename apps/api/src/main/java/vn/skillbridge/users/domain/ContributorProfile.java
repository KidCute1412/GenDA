package vn.skillbridge.users.domain;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** The contributor's self-declared background, specialization and canonical skills. */
public record ContributorProfile(
        UUID userId,
        BackgroundType backgroundType,
        String specialization,
        List<String> skillCodes,
        Instant createdAt,
        Instant updatedAt) {

    public static final int MAX_SKILLS = 8;

    public ContributorProfile {
        skillCodes = List.copyOf(skillCodes);
    }

    /** Education is optional and therefore not part of completeness (BR-16). */
    public boolean isComplete() {
        return backgroundType != null && specialization != null && !specialization.isBlank()
                && !skillCodes.isEmpty();
    }
}
