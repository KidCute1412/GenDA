package vn.skillbridge.auth.infrastructure.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SecureCsrfTokenServiceTest {
    private final SecureCsrfTokenService service = new SecureCsrfTokenService();

    @Test
    void reusesExistingToken() {
        assertThat(service.issue("existing-token")).isEqualTo("existing-token");
    }

    @Test
    void generatesUrlSafeTokenWhenCookieIsMissing() {
        assertThat(service.issue(null)).matches("[A-Za-z0-9_-]{43}");
    }

    @Test
    void matchesOnlyEqualNonNullTokens() {
        assertThat(service.matches("same-token", "same-token")).isTrue();
        assertThat(service.matches("same-token", "different-token")).isFalse();
        assertThat(service.matches(null, "same-token")).isFalse();
        assertThat(service.matches("same-token", null)).isFalse();
    }
}
