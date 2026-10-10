package vn.skillbridge.applications.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import vn.skillbridge.applications.application.ApplicantView;
import vn.skillbridge.applications.domain.ApplicationStatus;
import vn.skillbridge.applications.domain.EligibilitySource;

/** An applicant as the owning SME reviews them. Self-declared data is labelled as such by the client. */
public record ApplicantResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) UUID applicationId,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) ApplicationStatus status,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) EligibilitySource eligibilitySource,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Instant submittedAt,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String coverLetter,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String displayName,
        @Schema(nullable = true, description = "Revealed only once the application is ACCEPTED") String contactEmail,
        @Schema(nullable = true) String backgroundType,
        @Schema(nullable = true) String specialization,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<ApplicantSkillResponse> skills,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<ApplicantEducationResponse> education,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, allowableValues = {"BRONZE", "SILVER", "GOLD"}) String tier,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int totalXp,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) ApplicantCompletedResponse completedProjects,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) ApplicantMatchResponse match,
        @Schema(nullable = true) ApplicantCvResponse cv) {

    public static ApplicantResponse from(ApplicantView view) {
        var application = view.application();
        var profile = view.profile();
        Set<String> matched = Set.copyOf(view.match().matchedSkills());
        return new ApplicantResponse(application.id(), application.status(), application.eligibilitySource(),
                application.submittedAt(), application.coverLetter(), profile.displayName(), view.contactEmail(),
                profile.backgroundType(), profile.specialization(),
                profile.skills().stream().map(skill -> new ApplicantSkillResponse(skill.code(), skill.name(),
                        matched.contains(skill.code()))).toList(),
                profile.education().stream().map(entry -> new ApplicantEducationResponse(entry.institution(),
                        entry.fieldOfStudy(), entry.level(), entry.degreeName(), entry.startMonth(), entry.endMonth(),
                        entry.status())).toList(),
                profile.tier(), profile.totalXp(),
                new ApplicantCompletedResponse(profile.completedByLevel().getOrDefault("BASIC", 0),
                        profile.completedByLevel().getOrDefault("MEDIUM", 0),
                        profile.completedByLevel().getOrDefault("HIGH", 0)),
                new ApplicantMatchResponse(view.match().percent(), view.match().matchedSkills().size(),
                        view.match().totalSkills()),
                profile.cv() == null ? null : new ApplicantCvResponse(profile.cv().fileName(), profile.cv().sizeBytes(),
                        profile.cv().pageCount(), profile.cv().uploadedAt()));
    }

    public record ApplicantSkillResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String code,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String name,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, description = "Required by the project") boolean matched) {
    }

    public record ApplicantEducationResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String institution,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String fieldOfStudy,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String level,
            @Schema(nullable = true) String degreeName,
            @Schema(nullable = true) String startMonth,
            @Schema(nullable = true) String endMonth,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String status) {
    }

    public record ApplicantCompletedResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int basic,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int medium,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int high) {
    }

    public record ApplicantMatchResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int percent,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int matchedSkills,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int totalSkills) {
    }

    public record ApplicantCvResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String fileName,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int sizeBytes,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int pageCount,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Instant uploadedAt) {
    }
}
