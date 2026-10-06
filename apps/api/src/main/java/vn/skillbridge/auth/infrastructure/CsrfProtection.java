package vn.skillbridge.auth.infrastructure;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.security.SecureRandom;
import java.util.Base64;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CsrfProtection {
    public static final String COOKIE_NAME = "genda_csrf";
    public static final String HEADER_NAME = "X-CSRF-Token";
    private final SecureRandom random = new SecureRandom();
    private final AuthProperties properties;

    public CsrfProtection(AuthProperties properties) {
        this.properties = properties;
    }

    public String issue(HttpServletRequest request, HttpServletResponse response) {
        String current = cookie(request, COOKIE_NAME);
        String token = current == null ? generate() : current;
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, token).httpOnly(false)
                .secure(properties.cookieSecure()).sameSite(properties.cookieSameSite())
                .path("/api/v1").build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return token;
    }

    public boolean valid(HttpServletRequest request) {
        String cookie = cookie(request, COOKIE_NAME);
        String header = request.getHeader(HEADER_NAME);
        return cookie != null && header != null && java.security.MessageDigest.isEqual(
                cookie.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                header.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private String generate() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String cookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) if (name.equals(cookie.getName())) return cookie.getValue();
        return null;
    }
}
