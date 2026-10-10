package vn.skillbridge.auth.infrastructure.security;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import vn.skillbridge.auth.application.account.PasswordService;

@Component
class BCryptPasswordService implements PasswordService {
    private final PasswordEncoder encoder;

    BCryptPasswordService(PasswordEncoder encoder) {
        this.encoder = encoder;
    }

    @Override
    public String hash(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    @Override
    public boolean matches(String rawPassword, String passwordHash) {
        return encoder.matches(rawPassword, passwordHash);
    }
}
