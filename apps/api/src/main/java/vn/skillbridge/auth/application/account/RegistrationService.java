package vn.skillbridge.auth.application.account;

import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.auth.application.AuthException;
import vn.skillbridge.auth.application.emailverification.EmailVerificationService;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.account.RegistrationIdentity;
import vn.skillbridge.auth.domain.account.UserRole;

@Service
public class RegistrationService {
    private final AuthUserRepository accounts;
    private final PasswordService passwords;
    private final EmailVerificationService emailVerifications;

    public RegistrationService(AuthUserRepository accounts, PasswordService passwords,
            EmailVerificationService emailVerifications) {
        this.accounts = accounts;
        this.passwords = passwords;
        this.emailVerifications = emailVerifications;
    }

    @Transactional
    public RegistrationResult register(RegistrationCommand command) {
        if (command.role() == null || command.role() == UserRole.ADMIN) {
            throw new AuthException("REGISTRATION_ROLE_INVALID", "Only CONTRIBUTOR and SME accounts can register");
        }

        String email = command.email().trim().toLowerCase(Locale.ROOT);
        if (accounts.findByEmail(email).isPresent()) {
            throw new AuthException("EMAIL_ALREADY_REGISTERED", "An account already exists for this email");
        }

        RegistrationIdentity identity;
        try {
            identity = RegistrationIdentity.create(command.role(), command.taxCode(), command.companyWebsite());
        } catch (IllegalArgumentException exception) {
            throw new AuthException("SME_IDENTITY_REQUIRED",
                    "SME registration requires a valid Vietnamese tax code or company website");
        }

        AuthUser user = new AuthUser(UUID.randomUUID(), email, passwords.hash(command.password()),
                command.name().trim(), command.role(), false,
                AccountState.PENDING_EMAIL_VERIFICATION,
                command.role() == UserRole.SME ? "PENDING" : null);
        accounts.create(user, identity.taxCode(), identity.companyWebsite());
        emailVerifications.issueInitial(user, command.requestSource());

        return new RegistrationResult(user);
    }
}
