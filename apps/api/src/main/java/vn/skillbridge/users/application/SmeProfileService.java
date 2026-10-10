package vn.skillbridge.users.application;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.auth.application.account.AccountProfile;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.users.domain.ContributorRuleViolation;
import vn.skillbridge.users.domain.SmeProfile;

@Service
public class SmeProfileService {
    private final SmeProfileRepository profiles;
    private final AccountProfileService accounts;

    public SmeProfileService(SmeProfileRepository profiles, AccountProfileService accounts) {
        this.profiles = profiles;
        this.accounts = accounts;
    }

    @Transactional(readOnly = true)
    public SmeProfileView get(UUID userId) {
        AccountProfile account = requireSme(userId);
        SmeProfile profile = profiles.findByUserId(userId).orElse(new SmeProfile(userId, null, null));
        return view(account, profile);
    }

    @Transactional
    public SmeProfileView update(UUID userId, String displayName, String description, String industry) {
        AccountProfile account = requireSme(userId);
        String name = ContributorProfileService.normalize(displayName);
        if (name == null || name.isBlank() || name.length() > 180) {
            throw new ContributorRuleViolation("SME_PROFILE_INVALID", "A business name of at most 180 characters is required");
        }
        SmeProfile profile = new SmeProfile(userId, description, industry);
        accounts.updateDisplayName(userId, name);
        profiles.save(profile);
        return view(new AccountProfile(account.id(), account.email(), name, account.role()), profile);
    }

    private AccountProfile requireSme(UUID userId) {
        AccountProfile account = accounts.get(userId);
        if (!accounts.isApprovedSme(userId)) {
            throw new UsersException(UsersException.SME_ROLE_REQUIRED, "An active SME account is required");
        }
        return account;
    }

    private SmeProfileView view(AccountProfile account, SmeProfile profile) {
        var identity = accounts.smeIdentity(account.id());
        return new SmeProfileView(account.displayName(), account.email(), identity.taxCode(), identity.companyWebsite(),
                profile.description(), profile.industry());
    }
}
