package vn.skillbridge.users.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import vn.skillbridge.users.application.ApplicationReadiness;

/** The general checklist. Applying is still re-checked on the server; tier gates are in the experience view. */
public record ApplicationReadinessResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) boolean accountActive,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) boolean emailVerified,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) boolean profileComplete,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) boolean cvReady,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) boolean ready) {

    public static ApplicationReadinessResponse from(ApplicationReadiness readiness) {
        return new ApplicationReadinessResponse(readiness.accountActive(), readiness.emailVerified(),
                readiness.profileComplete(), readiness.cvReady(), readiness.ready());
    }
}
