package vn.skillbridge.projects.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.util.List;
import vn.skillbridge.projects.application.ProjectView;

public record ProjectSummaryResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String id,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String title,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String smeName,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String smeIndustry,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) long budget,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) LocalDate deadline,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String summary,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<SkillResponse> skills) {

    static ProjectSummaryResponse from(ProjectView project) {
        return new ProjectSummaryResponse(
                project.id(), project.title(), project.smeName(), project.smeIndustry(), project.budget(),
                project.deadline(), project.summary(), project.skills().stream().map(SkillResponse::from).toList());
    }
}
