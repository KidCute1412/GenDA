package vn.skillbridge.auth.infrastructure.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.account.UserRole;
import vn.skillbridge.auth.infrastructure.config.AuthProperties;

class JwtTokenServiceTest {
    private final JwtTokenService tokens = new JwtTokenService(new AuthProperties(
            "test-secret-that-is-at-least-32-bytes-long",
            "genda-test",
            Duration.ofMinutes(5),
            Duration.ofHours(24),
            Duration.ofDays(7),
            true,
            "None"));

    @Test
    void accessTokenCarriesAccountStateWithoutLegacyStudentVerificationClaim() {
        var user = new AuthUser(UUID.randomUUID(), "contributor@example.com", "hash", "Contributor",
                UserRole.CONTRIBUTOR, true, AccountState.ACTIVE, null);

        String token = tokens.issueAccessToken(user, Instant.now(), Duration.ofMinutes(5));
        var claims = tokens.parseAccessToken(token);
        String payload = new String(Base64.getUrlDecoder().decode(token.split("\\.")[1]), StandardCharsets.UTF_8);

        assertThat(claims.accountState()).isEqualTo(AccountState.ACTIVE);
        assertThat(claims.emailVerified()).isTrue();
        assertThat(payload).contains("\"accountState\":\"ACTIVE\"")
                .doesNotContain("studentVerificationStatus");
    }
}
