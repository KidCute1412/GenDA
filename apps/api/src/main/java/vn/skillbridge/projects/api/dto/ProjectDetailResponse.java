package vn.skillbridge.projects.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.util.List;
import vn.skillbridge.projects.application.ProjectView;
import vn.skillbridge.projects.domain.ProjectComplexity;

public record ProjectDetailResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String id,
        @Schema(description = "Display name of the account that posted the project", nullable = true) String posterDisplayName,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String title,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String smeName,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String smeIndustry,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String smeSize,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String smeContact,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) ProjectComplexity complexity,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) long budget,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) LocalDate deadline,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String summary,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String problem,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<SkillResponse> skills,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<String> acceptanceCriteria,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<MilestoneResponse> milestones) {

    public static ProjectDetailResponse from(ProjectView project) {
        return new ProjectDetailResponse(
                project.id(), project.posterDisplayName(), project.title(), project.smeName(), project.smeIndustry(), project.smeSize(),
                project.smeContact(), project.complexity(), project.budget(), project.deadline(), project.summary(), project.problem(),
                project.skills().stream().map(SkillResponse::from).toList(), project.acceptanceCriteria(),
                project.milestones().stream().map(MilestoneResponse::from).toList());
    }
}
