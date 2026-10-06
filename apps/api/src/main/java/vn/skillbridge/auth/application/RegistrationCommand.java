package vn.skillbridge.auth.application;

import vn.skillbridge.auth.domain.UserRole;

public record RegistrationCommand(
        String name,
        String email,
        String password,
        UserRole role,
        String taxCode,
        String companyWebsite) {
}

