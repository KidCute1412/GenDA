package vn.skillbridge.auth.domain.account;

import java.util.UUID;

public record AuthUser(
        UUID id,
        String email,
        String passwordHash,
        String displayName,
        UserRole role,
        AccountState accountState,
        String smeApprovalStatus) {

    public boolean canSignIn() {
        return accountState == AccountState.ACTIVE;
    }
}
