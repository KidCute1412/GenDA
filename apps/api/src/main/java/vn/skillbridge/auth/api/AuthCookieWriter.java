package vn.skillbridge.auth.api;

import jakarta.servlet.http.HttpServletResponse;
import java.time.Clock;
import java.time.Duration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import vn.skillbridge.auth.application.session.AuthCookieSettings;
import vn.skillbridge.auth.application.session.AuthResult;

@Component
class AuthCookieWriter {
    static final String ACCESS_COOKIE = "genda_access";
    static final String REFRESH_COOKIE = "genda_refresh";
    static final String CSRF_COOKIE = "genda_csrf";
    private final AuthCookieSettings settings;
    private final Clock clock;

    AuthCookieWriter(AuthCookieSettings settings, Clock clock) {
        this.settings = settings;
        this.clock = clock;
    }

    void write(HttpServletResponse response, AuthResult result) {
        add(response, authCookie(ACCESS_COOKIE, result.accessToken(), "/api", settings.accessTtl()));
        Duration refreshMaxAge = Duration.between(clock.instant(), result.refreshExpiresAt());
        add(response, authCookie(REFRESH_COOKIE, result.refreshToken(), "/api/v1/auth", refreshMaxAge));
    }

    void writeCsrf(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(CSRF_COOKIE, token).httpOnly(false).secure(settings.secure())
                .sameSite(settings.sameSite()).path("/api/v1").build();
        add(response, cookie);
    }

    void clear(HttpServletResponse response) {
        add(response, authCookie(ACCESS_COOKIE, "", "/api", Duration.ZERO));
        add(response, authCookie(REFRESH_COOKIE, "", "/api/v1/auth", Duration.ZERO));
    }

    private ResponseCookie authCookie(String name, String value, String path, Duration maxAge) {
        return ResponseCookie.from(name, value).httpOnly(true).secure(settings.secure())
                .sameSite(settings.sameSite()).path(path).maxAge(maxAge).build();
    }

    private static void add(HttpServletResponse response, ResponseCookie cookie) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
