package vn.skillbridge.projects.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import vn.skillbridge.projects.application.authoring.ProjectDraftCommand;
import vn.skillbridge.projects.domain.ProjectComplexity;

/**
 * Full draft content. Only the title is required to save; completeness, the level budget range and milestone totals
 * are enforced when the draft is submitted.
 */
public record ProjectDraftRequest(
        @NotBlank @Size(max = 180) String title,
        @Size(max = 500) String summary,
        @Size(max = 5000) String problem,
        @Size(max = 120) String industry,
        @Size(max = 80) String smeSize,
        ProjectComplexity complexity,
        @Min(1_000_000) @Max(5_000_000) Long budget,
        LocalDate deadline,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull @Size(max = 5) List<@NotBlank @Size(max = 64) String> skillCodes,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull @Size(max = 10) List<@NotNull @Size(max = 500) String> acceptanceCriteria,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull @Size(max = 10) List<@NotNull @Valid MilestonePlanRequest> milestones) {

    public ProjectDraftCommand toCommand() {
        return new ProjectDraftCommand(title, summary, problem, industry, smeSize, complexity, budget, deadline,
                skillCodes, acceptanceCriteria,
                milestones.stream().map(MilestonePlanRequest::toCommand).toList());
    }

    public record MilestonePlanRequest(
            @Size(max = 180) String title,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) @Min(0) @Max(5_000_000) long budget,
            LocalDate deadline,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            @NotNull @Size(max = 10) List<@NotNull @Size(max = 500) String> criteria) {

        ProjectDraftCommand.MilestonePlanCommand toCommand() {
            return new ProjectDraftCommand.MilestonePlanCommand(title, budget, deadline, criteria);
        }
    }
}
