package vn.skillbridge.auth.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import vn.skillbridge.auth.application.session.AuthCookieSettings;
import vn.skillbridge.auth.application.session.AuthResult;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.auth.domain.account.UserRole;

class AuthCookieWriterTest {
    private static final Instant NOW = Instant.parse("2026-10-07T00:00:00Z");

    @Test
    void writesHttpOnlyScopedCookiesWithoutExposingTokensInTheBody() {
        AuthCookieWriter writer = writer();
        var user = new AuthUser(UUID.randomUUID(), "student@example.com", "hash", "Student", UserRole.CONTRIBUTOR, AccountState.ACTIVE, null);
        MockHttpServletResponse response = new MockHttpServletResponse();

        writer.write(response, new AuthResult(user, "access-token", "refresh-token", NOW.plus(Duration.ofDays(7))));

        List<String> cookies = response.getHeaders("Set-Cookie");
        assertThat(cookies).hasSize(2);
        assertThat(cookies.get(0)).contains("genda_access=access-token", "Path=/api", "Max-Age=300",
                "Secure", "HttpOnly", "SameSite=None");
        assertThat(cookies.get(1)).contains("genda_refresh=refresh-token", "Path=/api/v1/auth",
                "Max-Age=604800", "Secure", "HttpOnly", "SameSite=None");
    }

    @Test
    void clearsBothCookiesUsingTheirOriginalPaths() {
        AuthCookieWriter writer = writer();
        MockHttpServletResponse response = new MockHttpServletResponse();

        writer.clear(response);

        List<String> cookies = response.getHeaders("Set-Cookie");
        assertThat(cookies).hasSize(2);
        assertThat(cookies.get(0)).contains("genda_access=", "Path=/api", "Max-Age=0", "HttpOnly");
        assertThat(cookies.get(1)).contains("genda_refresh=", "Path=/api/v1/auth", "Max-Age=0", "HttpOnly");
    }

    @Test
    void writesReadableCsrfCookieWithApiScope() {
        MockHttpServletResponse response = new MockHttpServletResponse();

        writer().writeCsrf(response, "csrf-token");

        assertThat(response.getHeader("Set-Cookie")).contains("genda_csrf=csrf-token", "Path=/api/v1",
                "Secure", "SameSite=None").doesNotContain("HttpOnly");
    }

    private static AuthCookieWriter writer() {
        var settings = new AuthCookieSettings(Duration.ofMinutes(5), true, "None");
        return new AuthCookieWriter(settings, Clock.fixed(NOW, ZoneOffset.UTC));
    }
}
