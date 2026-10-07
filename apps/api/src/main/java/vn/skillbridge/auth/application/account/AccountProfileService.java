package vn.skillbridge.auth.application.account;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.auth.application.AuthException;

@Service
public class AccountProfileService {
    private final AuthUserRepository accounts;

    public AccountProfileService(AuthUserRepository accounts) {
        this.accounts = accounts;
    }

    @Transactional(readOnly = true)
    public AccountProfile get(UUID userId) {
        var account = accounts.findById(userId)
                .orElseThrow(() -> new AuthException("ACCOUNT_NOT_FOUND", "Account does not exist"));
        return new AccountProfile(account.id(), account.email(), account.displayName(), account.role().name(),
                account.studentVerificationStatus());
    }

    @Transactional
    public void updateDisplayName(UUID userId, String displayName) {
        accounts.updateDisplayName(userId, displayName);
    }
}
