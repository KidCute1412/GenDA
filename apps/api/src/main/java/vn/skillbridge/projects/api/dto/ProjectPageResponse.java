package vn.skillbridge.projects.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import vn.skillbridge.projects.application.ProjectPage;
import vn.skillbridge.projects.application.ProjectView;

public record ProjectPageResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<ProjectSummaryResponse> data,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int page,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int pageSize,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) long total) {

    public static ProjectPageResponse from(ProjectPage<ProjectView> projects) {
        return new ProjectPageResponse(
                projects.data().stream().map(ProjectSummaryResponse::from).toList(),
                projects.page(), projects.pageSize(), projects.total());
    }
}
