package vn.skillbridge.auth.application.account;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import java.time.Clock;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import vn.skillbridge.auth.application.AuthException;

class AuthRateLimitServiceTest {
    private final Clock clock = mock(Clock.class);
    private final Instant now = Instant.parse("2026-10-10T00:00:00Z");
    private final AuthRateLimitService limits = new AuthRateLimitService(clock);

    @Test
    void limitsNormalizedEmailAcrossSourcesAndAllowsAnotherWindow() {
        when(clock.instant()).thenReturn(now);
        for (int i = 0; i < 10; i++) limits.login(" User@Example.com ", "source-" + i);
        assertThatThrownBy(() -> limits.login("user@example.com", "another-source"))
                .isInstanceOfSatisfying(AuthException.class, error -> {
                    assertThat(error.code()).isEqualTo("AUTH_RATE_LIMITED");
                    assertThat(error.retryAfter()).isEqualTo(900L);
                });
        when(clock.instant()).thenReturn(now.plusSeconds(900));
        limits.login("user@example.com", "another-source");
    }

    @Test
    void limitsSourceEvenWhenEmailsChange() {
        when(clock.instant()).thenReturn(now);
        for (int i = 0; i < 30; i++) limits.login("user" + i + "@example.com", "source");
        assertThatThrownBy(() -> limits.login("next@example.com", "source")).isInstanceOf(AuthException.class);
        limits.login("next@example.com", "other-source");
    }

    @Test
    void limitsRegistrationAndExpiresItsOwnWindow() {
        when(clock.instant()).thenReturn(now);
        for (int i = 0; i < 5; i++) limits.register("source");
        assertThatThrownBy(() -> limits.register("source")).isInstanceOf(AuthException.class);
        when(clock.instant()).thenReturn(now.plusSeconds(3600));
        limits.register("source");
    }

    @Test
    void boundsMemoryWithoutEvictingActiveLimits() {
        when(clock.instant()).thenReturn(now);
        for (int i = 0; i < 9999; i++) limits.register("source-" + i);
        assertThatThrownBy(() -> limits.register("overflow")).isInstanceOf(AuthException.class);
        when(clock.instant()).thenReturn(now.plusSeconds(3600));
        limits.register("overflow");
    }
}
