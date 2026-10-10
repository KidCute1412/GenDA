package vn.skillbridge.auth.application.account;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.auth.application.AuthException;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.auth.domain.account.UserRole;

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
        return new AccountProfile(account.id(), account.email(), account.displayName(), account.role().name());
    }

    @Transactional(readOnly = true)
    public AccountStanding standing(UUID userId) {
        var account = accounts.findById(userId)
                .orElseThrow(() -> new AuthException("ACCOUNT_NOT_FOUND", "Account does not exist"));
        return new AccountStanding(account.accountState() == AccountState.ACTIVE);
    }

    /** Facade for modules that act on behalf of an SME: the account must currently be allowed to sign in. */
    @Transactional(readOnly = true)
    public boolean isApprovedSme(UUID userId) {
        return accounts.findById(userId).filter(account -> account.role() == UserRole.SME && account.canSignIn())
                .isPresent();
    }

    @Transactional(readOnly = true)
    public boolean isActiveAdmin(UUID userId) {
        return accounts.findById(userId).filter(account -> account.role() == UserRole.ADMIN && account.canSignIn())
                .isPresent();
    }

    @Transactional
    public void updateDisplayName(UUID userId, String displayName) {
        accounts.updateDisplayName(userId, displayName);
    }

    @Transactional(readOnly = true)
    public SmeIdentity smeIdentity(UUID userId) {
        return accounts.findSmeIdentity(userId)
                .orElseThrow(() -> new AuthException("ACCOUNT_NOT_FOUND", "SME account does not exist"));
    }
}
