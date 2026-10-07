package vn.skillbridge.auth.application.session;

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
