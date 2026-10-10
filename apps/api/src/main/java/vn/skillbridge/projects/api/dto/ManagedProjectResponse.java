package vn.skillbridge.projects.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import vn.skillbridge.projects.application.ManagedProjectView;
import vn.skillbridge.projects.domain.ProjectComplexity;
import vn.skillbridge.projects.domain.ProjectStatus;
import vn.skillbridge.projects.domain.ReadinessIssue;

/** A project as its owning SME or a reviewing admin sees it. Draft-only fields may be null. */
public record ManagedProjectResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String id,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) ProjectStatus status,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String title,
        String summary,
        String problem,
        String industry,
        String smeSize,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String smeName,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String smeContact,
        ProjectComplexity complexity,
        Long budget,
        LocalDate deadline,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<SkillResponse> skills,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<String> acceptanceCriteria,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<MilestonePlanResponse> milestones,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED,
                description = "What blocks submission today; empty when the project could enter review")
        List<ReadinessIssue> submissionIssues,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Instant createdAt,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Instant updatedAt,
        Instant submittedAt,
        Instant publishedAt,
        @Schema(description = "Present while the latest review decision returned the project to draft")
        ProjectReturnResponse latestReturn) {

    public static ManagedProjectResponse from(ManagedProjectView project) {
        return new ManagedProjectResponse(
                project.id(), project.status(), project.title(), project.summary(), project.problem(),
                project.industry(), project.smeSize(), project.smeName(), project.smeContact(),
                project.complexity(), project.budget(), project.deadline(),
                project.skills().stream().map(SkillResponse::from).toList(), project.acceptanceCriteria(),
                project.milestones().stream().map(MilestonePlanResponse::from).toList(),
                project.submissionIssues(), project.createdAt(), project.updatedAt(), project.submittedAt(),
                project.publishedAt(),
                project.latestReturn() == null ? null : ProjectReturnResponse.from(project.latestReturn()));
    }

    public record MilestonePlanResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String id,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int order,
            String title,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) long budget,
            LocalDate deadline,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<String> criteria) {

        static MilestonePlanResponse from(ManagedProjectView.MilestonePlanView milestone) {
            return new MilestonePlanResponse(milestone.id(), milestone.order(), milestone.title(),
                    milestone.budget(), milestone.deadline(), milestone.criteria());
        }
    }

    public record ProjectReturnResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String reason,
            ProjectComplexity suggestedComplexity,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Instant returnedAt) {

        static ProjectReturnResponse from(ManagedProjectView.ReturnNote note) {
            return new ProjectReturnResponse(note.reason(), note.suggestedComplexity(), note.returnedAt());
        }
    }
}
