package vn.skillbridge.admin.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import vn.skillbridge.projects.domain.ProjectComplexity;

/** Why the project goes back to its SME, plus the level the admin believes the scope actually needs. */
public record ReturnProjectRequest(
        @NotBlank @Size(min = 10, max = 1000) String reason,
        ProjectComplexity suggestedComplexity) {
}
