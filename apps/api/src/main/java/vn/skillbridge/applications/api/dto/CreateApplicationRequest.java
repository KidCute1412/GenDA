package vn.skillbridge.applications.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** The length rule (80-3000 after trimming) is a domain rule and answers 422 with details. */
public record CreateApplicationRequest(
        @NotBlank @Size(max = 100) String projectId,
        @NotBlank @Size(max = 4000) String coverLetter) {
}
