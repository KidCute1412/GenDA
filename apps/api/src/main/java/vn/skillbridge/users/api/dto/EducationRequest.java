package vn.skillbridge.users.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.YearMonth;
import vn.skillbridge.users.domain.Education;
import vn.skillbridge.users.domain.EducationLevel;
import vn.skillbridge.users.domain.EducationStatus;

public record EducationRequest(
        @NotBlank @Size(max = 180) String institution,
        @NotBlank @Size(max = 180) String fieldOfStudy,
        @NotNull EducationLevel level,
        @Size(max = 180) String degreeName,
        @Schema(example = "2023-09", description = "Month the entry started, YYYY-MM")
        @NotNull @Pattern(regexp = MONTH) String startMonth,
        @Schema(example = "2027-06", description = "Month it ended, or the expected end while studying, YYYY-MM")
        @Pattern(regexp = MONTH) String endMonth,
        @NotNull EducationStatus status,
        @Size(max = 1000) String description) {

    static final String MONTH = "^\\d{4}-(0[1-9]|1[0-2])$";

    public Education.Details toDetails() {
        return new Education.Details(institution, fieldOfStudy, level, degreeName, YearMonth.parse(startMonth),
                endMonth == null || endMonth.isBlank() ? null : YearMonth.parse(endMonth), status, description);
    }
}
