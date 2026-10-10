package vn.skillbridge.auth.api;

import jakarta.servlet.http.HttpServletResponse;
import java.time.Clock;
import java.time.Duration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import vn.skillbridge.auth.application.AuthResult;
import vn.skillbridge.auth.infrastructure.AuthProperties;

@Component
class AuthCookieWriter {
    static final String ACCESS_COOKIE = "genda_access";
    static final String REFRESH_COOKIE = "genda_refresh";
    private final AuthProperties properties;
    private final Clock clock;

    AuthCookieWriter(AuthProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
    }

    void write(HttpServletResponse response, AuthResult result) {
        add(response, cookie(ACCESS_COOKIE, result.accessToken(), "/api", properties.accessTtl()));
        Duration refreshMaxAge = Duration.between(clock.instant(), result.refreshExpiresAt());
        add(response, cookie(REFRESH_COOKIE, result.refreshToken(), "/api/v1/auth", refreshMaxAge));
    }

    void clear(HttpServletResponse response) {
        add(response, cookie(ACCESS_COOKIE, "", "/api", Duration.ZERO));
        add(response, cookie(REFRESH_COOKIE, "", "/api/v1/auth", Duration.ZERO));
    }

    private ResponseCookie cookie(String name, String value, String path, Duration maxAge) {
        return ResponseCookie.from(name, value).httpOnly(true).secure(properties.cookieSecure())
                .sameSite(properties.cookieSameSite()).path(path).maxAge(maxAge).build();
    }

    private static void add(HttpServletResponse response, ResponseCookie cookie) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
