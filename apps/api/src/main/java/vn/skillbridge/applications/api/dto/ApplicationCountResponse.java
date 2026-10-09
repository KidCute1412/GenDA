package vn.skillbridge.applications.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record ApplicationCountResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String projectId,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, description = "Awaiting the SME's decision") int open,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, description = "Every application except withdrawn ones") int total) {
}
