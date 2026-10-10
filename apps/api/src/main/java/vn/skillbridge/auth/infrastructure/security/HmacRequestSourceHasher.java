package vn.skillbridge.auth.infrastructure.security;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;
import vn.skillbridge.auth.application.emailverification.RequestSourceHasher;
import vn.skillbridge.auth.infrastructure.config.AuthProperties;

@Component
class HmacRequestSourceHasher implements RequestSourceHasher {
    private final byte[] secret;

    HmacRequestSourceHasher(AuthProperties properties) {
        this.secret = properties.jwtSecret().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public String hash(String requestSource) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            String normalized = requestSource == null || requestSource.isBlank() ? "unknown" : requestSource.trim();
            return HexFormat.of().formatHex(mac.doFinal(normalized.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Unable to hash verification request source", exception);
        }
    }
}
