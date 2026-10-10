package vn.skillbridge.auth.application.account;

import java.util.UUID;

public record AccountProfile(
        UUID id,
        String email,
        String displayName,
        String role,
        String studentVerificationStatus) {
}
