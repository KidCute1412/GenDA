package vn.skillbridge.users.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import vn.skillbridge.users.domain.StudyYear;

public record UpdateStudentProfileRequest(
        @NotBlank @Size(max = 180) String displayName,
        @NotBlank @Size(max = 180) String school,
        @NotBlank @Size(max = 180) String major,
        @NotNull StudyYear studyYear,
        @NotNull @Size(min = 1, max = 8) List<@NotBlank @Size(max = 64) String> skillCodes) {
}
