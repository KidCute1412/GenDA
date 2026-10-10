package vn.skillbridge.auth.application.account;

import vn.skillbridge.auth.domain.account.UserRole;

public record RegistrationCommand(
        String name,
        String email,
        String password,
        UserRole role,
        String taxCode,
        String companyWebsite) {
}
