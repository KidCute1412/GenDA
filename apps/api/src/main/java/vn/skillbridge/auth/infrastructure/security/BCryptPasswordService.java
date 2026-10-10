package vn.skillbridge.auth.infrastructure.security;

import java.nio.charset.StandardCharsets;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import vn.skillbridge.auth.application.account.PasswordService;
import vn.skillbridge.auth.application.AuthException;

@Component
class BCryptPasswordService implements PasswordService {
    private final PasswordEncoder encoder;

    BCryptPasswordService(PasswordEncoder encoder) {
        this.encoder = encoder;
    }

    @Override
    public String hash(String rawPassword) {
        if (rawPassword.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new AuthException("PASSWORD_INVALID", "Password must not exceed 72 UTF-8 bytes");
        }
        return encoder.encode(rawPassword);
    }

    @Override
    public boolean matches(String rawPassword, String passwordHash) {
        if (rawPassword.getBytes(StandardCharsets.UTF_8).length > 72) return false;
        return encoder.matches(rawPassword, passwordHash);
    }
}
