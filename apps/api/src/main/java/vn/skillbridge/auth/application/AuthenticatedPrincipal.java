package vn.skillbridge.auth.application;

import java.util.UUID;

public record AuthenticatedPrincipal(
        UUID id,
        String email,
        String displayName,
        String role,
        boolean emailVerified,
        String studentVerificationStatus,
        String smeApprovalStatus) {
}
