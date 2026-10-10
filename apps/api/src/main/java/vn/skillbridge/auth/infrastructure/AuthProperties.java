package vn.skillbridge.auth.infrastructure;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.auth")
public record AuthProperties(
        String jwtSecret,
        String issuer,
        Duration accessTtl,
        Duration refreshTtl,
        Duration rememberedRefreshTtl,
        boolean cookieSecure,
        String cookieSameSite) {
}
