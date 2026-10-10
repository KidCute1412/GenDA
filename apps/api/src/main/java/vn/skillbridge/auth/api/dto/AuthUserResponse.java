package vn.skillbridge.auth.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.auth.domain.account.AuthUser;

public record AuthUserResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) UUID id,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String email,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String name,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, allowableValues = {"CONTRIBUTOR", "SME", "ADMIN"}) String role,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) AccountState accountState,
        @Schema(deprecated = true, description = "Legacy historical value; unused for MVP access") String smeApprovalStatus) {

    public static AuthUserResponse from(AuthUser user) {
        return new AuthUserResponse(user.id(), user.email(), user.displayName(), user.role().name(),
                user.accountState(), user.smeApprovalStatus());
    }

    public static AuthUserResponse from(AuthenticatedPrincipal principal) {
        return new AuthUserResponse(principal.id(), principal.email(), principal.displayName(), principal.role(),
                principal.accountState(), principal.smeApprovalStatus());
    }
}
