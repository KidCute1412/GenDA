package vn.skillbridge.platform.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Map;

public record ApiError(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String code,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String message,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String requestId,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) Map<String, Object> details) {
    public ApiError(String code, String message, String requestId) {
        this(code, message, requestId, null);
    }
}
