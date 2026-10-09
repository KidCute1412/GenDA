package vn.skillbridge.applications.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;
import vn.skillbridge.applications.application.ContributorApplicationView;
import vn.skillbridge.applications.domain.ApplicationStatus;

public record ContributorApplicationResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) UUID id,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String projectId,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String projectTitle,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String smeName,
        @Schema(nullable = true) Long budget,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, allowableValues = {"BASIC", "MEDIUM", "HIGH"}) String complexity,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String projectStatus,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) ApplicationStatus status,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String coverLetter,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Instant submittedAt,
        @Schema(nullable = true) Instant decidedAt) {

    public static ContributorApplicationResponse from(ContributorApplicationView view) {
        var application = view.application();
        var project = view.project();
        return new ContributorApplicationResponse(application.id(), project.id(), project.title(), project.smeName(),
                project.budget(), project.complexity(), project.status(), application.status(),
                application.coverLetter(), application.submittedAt(), application.decidedAt());
    }
}
