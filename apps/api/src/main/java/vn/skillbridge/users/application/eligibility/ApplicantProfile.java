package vn.skillbridge.users.application.eligibility;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import vn.skillbridge.users.application.SkillSummary;

/**
 * What the owning SME sees about an applicant: self-declared profile and education, the GenDA delivery tier, and
 * CV metadata. The email is the contributor's contact; the applications module decides when to reveal it.
 */
public record ApplicantProfile(
        UUID userId,
        String displayName,
        String email,
        String backgroundType,
        String specialization,
        List<SkillSummary> skills,
        List<Education> education,
        String tier,
        int totalXp,
        Map<String, Integer> completedByLevel,
        Cv cv) {

    public ApplicantProfile {
        skills = List.copyOf(skills);
        education = List.copyOf(education);
        completedByLevel = Map.copyOf(completedByLevel);
    }

    public record Education(String institution, String fieldOfStudy, String level, String degreeName,
            String startMonth, String endMonth, String status) {
    }

    public record Cv(String fileName, int sizeBytes, int pageCount, Instant uploadedAt) {
    }
}
