package vn.skillbridge.auth.application.account;

import vn.skillbridge.auth.application.session.AuthResult;
import vn.skillbridge.auth.domain.account.AuthUser;

public record RegistrationResult(AuthUser user, AuthResult session) {
    public boolean sessionIssued() {
        return session != null;
    }
}
