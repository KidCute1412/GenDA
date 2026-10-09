package vn.skillbridge.users.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.UUID;
import vn.skillbridge.users.application.ContributorProfileView;
import vn.skillbridge.users.domain.BackgroundType;

public record ContributorProfileResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) UUID userId,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String email,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String displayName,
        @Schema(nullable = true) BackgroundType backgroundType,
        @Schema(nullable = true) String specialization,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<SkillCatalogItemResponse> skills,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) boolean complete) {

    public static ContributorProfileResponse from(ContributorProfileView profile) {
        return new ContributorProfileResponse(profile.userId(), profile.email(), profile.displayName(),
                profile.backgroundType(), profile.specialization(),
                profile.skills().stream().map(SkillCatalogItemResponse::from).toList(), profile.complete());
    }
}
