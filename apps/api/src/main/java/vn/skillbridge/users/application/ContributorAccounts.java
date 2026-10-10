package vn.skillbridge.users.application;

import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.skillbridge.auth.application.account.AccountProfile;
import vn.skillbridge.auth.application.account.AccountProfileService;

/** Every contributor use case acts only on the caller's own contributor account. */
@Component
class ContributorAccounts {
    private final AccountProfileService accounts;

    ContributorAccounts(AccountProfileService accounts) {
        this.accounts = accounts;
    }

    AccountProfile require(UUID userId) {
        AccountProfile account = accounts.get(userId);
        if (!"CONTRIBUTOR".equals(account.role())) {
            throw new UsersException(UsersException.CONTRIBUTOR_ROLE_REQUIRED, "A contributor account is required");
        }
        return account;
    }
}
