package vn.skillbridge.projects.api;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.util.List;
import vn.skillbridge.projects.application.ProjectView;

public record MilestoneResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String id,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int order,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String title,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) long budget,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) LocalDate deadline,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<String> criteria) {

    static MilestoneResponse from(ProjectView.MilestoneView milestone) {
        return new MilestoneResponse(
                milestone.id(), milestone.order(), milestone.title(), milestone.budget(), milestone.deadline(),
                milestone.criteria());
    }
}
