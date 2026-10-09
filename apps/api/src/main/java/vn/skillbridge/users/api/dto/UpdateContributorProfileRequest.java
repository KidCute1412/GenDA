package vn.skillbridge.users.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import vn.skillbridge.users.domain.BackgroundType;

public record UpdateContributorProfileRequest(
        @NotBlank @Size(max = 180) String displayName,
        @NotNull BackgroundType backgroundType,
        @NotBlank @Size(max = 180) String specialization,
        @NotNull @Size(min = 1, max = 8) List<@NotBlank @Size(max = 64) String> skillCodes) {
}
