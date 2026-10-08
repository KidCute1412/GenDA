package vn.skillbridge.platform.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record ApiError(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String code,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String message,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String requestId) {}
