package vn.skillbridge.projects.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import vn.skillbridge.projects.application.ProjectCreationPolicyView;
import vn.skillbridge.projects.domain.ProjectComplexity;

/** Server-owned budget policy; all ranges are inclusive VND amounts. */
public record ProjectCreationPolicyResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) long minimumBudget,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) long maximumBudget,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<LevelPolicyResponse> levels) {

    public static ProjectCreationPolicyResponse from(ProjectCreationPolicyView policy) {
        return new ProjectCreationPolicyResponse(policy.minimumBudget(), policy.maximumBudget(),
                policy.levels().stream()
                        .map(level -> new LevelPolicyResponse(level.complexity(), level.minimumBudget(),
                                level.maximumBudget()))
                        .toList());
    }

    public record LevelPolicyResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) ProjectComplexity complexity,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) long minimumBudget,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) long maximumBudget) {}
}
