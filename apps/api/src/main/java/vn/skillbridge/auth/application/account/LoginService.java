package vn.skillbridge.auth.application.account;

import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.auth.application.AuthException;
import vn.skillbridge.auth.application.session.AuthResult;
import vn.skillbridge.auth.application.session.SessionIssuer;

@Service
public class LoginService {
    private final AuthUserRepository accounts;
    private final PasswordService passwords;
    private final SessionIssuer sessions;

    public LoginService(AuthUserRepository accounts, PasswordService passwords, SessionIssuer sessions) {
        this.accounts = accounts;
        this.passwords = passwords;
        this.sessions = sessions;
    }

    @Transactional
    public AuthResult login(String email, String password, boolean rememberDevice) {
        var user = accounts.findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .filter(candidate -> passwords.matches(password, candidate.passwordHash()))
                .orElseThrow(LoginService::invalidCredentials);
        if (!user.canSignIn()) {
            String code = switch (user.accountState()) {
                case PENDING_EMAIL_VERIFICATION -> "EMAIL_VERIFICATION_REQUIRED";
                case EMAIL_VERIFIED -> "SME_NOT_APPROVED";
                case DISABLED -> "ACCOUNT_DISABLED";
                case ACTIVE -> "SME_NOT_APPROVED";
            };
            throw new AuthException(code, "Account is not allowed to sign in");
        }
        return sessions.issue(user, rememberDevice);
    }

    private static AuthException invalidCredentials() {
        return new AuthException("INVALID_CREDENTIALS", "Email or password is incorrect");
    }
}
