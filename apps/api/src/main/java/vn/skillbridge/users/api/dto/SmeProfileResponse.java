package vn.skillbridge.users.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import vn.skillbridge.users.application.SmeProfileView;

public record SmeProfileResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String displayName,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String email,
        String taxCode, String companyWebsite, String description, String industry) {
    public static SmeProfileResponse from(SmeProfileView view) {
        return new SmeProfileResponse(view.displayName(), view.email(), view.taxCode(), view.companyWebsite(),
                view.description(), view.industry());
    }
}
