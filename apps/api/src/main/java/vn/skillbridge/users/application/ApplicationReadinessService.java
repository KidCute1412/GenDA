package vn.skillbridge.users.application;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.auth.application.account.AccountStanding;

/**
 * Derives readiness at request time; it is never stored as a flag. The checklist is guidance for the
 * contributor; submitting an application re-evaluates it on the server.
 */
@Service
public class ApplicationReadinessService {
    private final AccountProfileService accounts;
    private final ContributorProfileService profiles;
    private final CvService cvs;
    private final ContributorAccounts contributors;

    public ApplicationReadinessService(AccountProfileService accounts, ContributorProfileService profiles,
            CvService cvs, ContributorAccounts contributors) {
        this.accounts = accounts;
        this.profiles = profiles;
        this.cvs = cvs;
        this.contributors = contributors;
    }

    @Transactional(readOnly = true)
    public ApplicationReadiness readiness(UUID userId) {
        contributors.require(userId);
        AccountStanding standing = accounts.standing(userId);
        return new ApplicationReadiness(standing.active(), standing.emailVerified(), profiles.isComplete(userId),
                cvs.hasReadyCv(userId));
    }
}
