package vn.skillbridge.users.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateSmeProfileRequest(@NotBlank @Size(max = 180) String displayName,
        @Size(max = 2000) String description, @Size(max = 120) String industry) {}
