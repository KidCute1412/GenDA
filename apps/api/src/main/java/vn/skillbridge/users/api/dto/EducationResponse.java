package vn.skillbridge.users.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.YearMonth;
import java.util.UUID;
import vn.skillbridge.users.domain.Education;
import vn.skillbridge.users.domain.EducationLevel;
import vn.skillbridge.users.domain.EducationStatus;

public record EducationResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) UUID id,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String institution,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String fieldOfStudy,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) EducationLevel level,
        @Schema(nullable = true) String degreeName,
        @Schema(nullable = true, example = "2023-09") String startMonth,
        @Schema(nullable = true, example = "2027-06") String endMonth,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) EducationStatus status,
        @Schema(nullable = true) String description,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED,
                description = "Always true: GenDA does not verify education entries") boolean selfDeclared) {

    public static EducationResponse from(Education education) {
        return new EducationResponse(education.id(), education.institution(), education.fieldOfStudy(),
                education.level(), education.degreeName(), month(education.startMonth()),
                month(education.endMonth()), education.status(), education.description(), true);
    }

    private static String month(YearMonth value) {
        return value == null ? null : value.toString();
    }
}
