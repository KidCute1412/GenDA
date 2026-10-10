package vn.skillbridge.auth.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 180) String name,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 8, max = 128) String password,
        @NotNull RegistrationRole role,
        @Size(max = 32) String taxCode,
        @Size(max = 512) String companyWebsite) {
}
