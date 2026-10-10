package vn.skillbridge.auth.domain.account;

import java.util.UUID;

public record AuthUser(
        UUID id,
        String email,
        String passwordHash,
        String displayName,
        UserRole role,
        boolean emailVerified,
        String studentVerificationStatus,
        String smeApprovalStatus,
        boolean active) {

    public boolean canSignIn() {
        return active && (role != UserRole.SME || "APPROVED".equals(smeApprovalStatus));
    }
}
