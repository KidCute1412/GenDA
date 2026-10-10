package vn.skillbridge.auth.infrastructure.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import org.springframework.stereotype.Component;
import vn.skillbridge.auth.application.session.CsrfTokenService;

@Component
public class SecureCsrfTokenService implements CsrfTokenService {
    private final SecureRandom random = new SecureRandom();

    @Override
    public String issue(String currentToken) {
        if (currentToken != null) return currentToken;
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    @Override
    public boolean matches(String cookieToken, String headerToken) {
        return cookieToken != null && headerToken != null && MessageDigest.isEqual(
                cookieToken.getBytes(StandardCharsets.UTF_8), headerToken.getBytes(StandardCharsets.UTF_8));
    }
}
