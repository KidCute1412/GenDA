package vn.skillbridge.auth.application.session;

import java.util.UUID;
import vn.skillbridge.auth.domain.account.AccountState;

public record AuthenticatedPrincipal(
        UUID id,
        String email,
        String displayName,
        String role,
        AccountState accountState,
        boolean emailVerified,
        String smeApprovalStatus) {
}
