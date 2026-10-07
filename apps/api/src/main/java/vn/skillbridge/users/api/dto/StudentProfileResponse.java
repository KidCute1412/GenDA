package vn.skillbridge.users.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.UUID;
import vn.skillbridge.users.application.StudentProfileView;
import vn.skillbridge.users.domain.StudyYear;

public record StudentProfileResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) UUID userId,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String email,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String displayName,
        @Schema(nullable = true) String school,
        @Schema(nullable = true) String major,
        @Schema(nullable = true) StudyYear studyYear,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<SkillCatalogItemResponse> skills,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String verificationStatus,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) boolean complete) {

    public static StudentProfileResponse from(StudentProfileView profile) {
        return new StudentProfileResponse(profile.userId(), profile.email(), profile.displayName(), profile.school(),
                profile.major(), profile.studyYear(), profile.skills().stream().map(SkillCatalogItemResponse::from).toList(),
                profile.verificationStatus(), profile.complete());
    }
}
