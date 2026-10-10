package vn.skillbridge.auth.api;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;
import vn.skillbridge.auth.application.AuthenticatedPrincipal;
import vn.skillbridge.auth.domain.AuthUser;

public record AuthUserResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) UUID id,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String email,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String name,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, allowableValues = {"STUDENT", "SME", "ADMIN"}) String role,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) boolean emailVerified,
        String studentVerificationStatus,
        String smeApprovalStatus) {

    static AuthUserResponse from(AuthUser user) {
        return new AuthUserResponse(user.id(), user.email(), user.displayName(), user.role().name(),
                user.emailVerified(), user.studentVerificationStatus(), user.smeApprovalStatus());
    }

    static AuthUserResponse from(AuthenticatedPrincipal principal) {
        return new AuthUserResponse(principal.id(), principal.email(), principal.displayName(), principal.role(),
                principal.emailVerified(), principal.studentVerificationStatus(), principal.smeApprovalStatus());
    }
}
