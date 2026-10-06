package vn.skillbridge.auth.application;

import vn.skillbridge.auth.domain.AuthUser;

public record RegistrationResult(AuthUser user, AuthResult session) {
    public boolean sessionIssued() {
        return session != null;
    }
}

