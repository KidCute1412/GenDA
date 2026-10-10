package vn.skillbridge.auth.application.session;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.skillbridge.auth.application.account.AuthUserRepository;

class SessionServiceTest {
    private static final Instant NOW = Instant.parse("2026-10-07T00:00:00Z");
    private final AuthUserRepository accounts = mock(AuthUserRepository.class);
    private final RefreshSessionRepository sessions = mock(RefreshSessionRepository.class);
    private final TokenService tokens = mock(TokenService.class);
    private SessionService service;

    @BeforeEach
    void setUp() {
        service = new SessionService(accounts, sessions, tokens, Clock.fixed(NOW, ZoneOffset.UTC),
                new AuthSettings(Duration.ofMinutes(5), Duration.ofHours(24), Duration.ofDays(7)));
    }

    @Test
    void revokesRefreshSessionOnLogout() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        when(tokens.parseRefreshToken("valid-refresh"))
                .thenReturn(new TokenService.RefreshTokenClaims(userId, sessionId));

        service.logout("valid-refresh");

        verify(sessions).revoke(sessionId, NOW);
    }

    @Test
    void treatsMissingRefreshCookieAsIdempotentLogout() {
        service.logout(null);

        verifyNoInteractions(sessions);
    }

    @Test
    void treatsMalformedRefreshCookieAsIdempotentLogout() {
        when(tokens.parseRefreshToken("malformed-refresh")).thenThrow(new IllegalArgumentException("invalid token"));

        service.logout("malformed-refresh");

        verifyNoInteractions(sessions);
    }

    @Test
    void propagatesFailureWhenRefreshSessionCannotBeRevoked() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        when(tokens.parseRefreshToken("valid-refresh"))
                .thenReturn(new TokenService.RefreshTokenClaims(userId, sessionId));
        doThrow(new IllegalStateException("database unavailable")).when(sessions).revoke(sessionId, NOW);

        assertThrows(IllegalStateException.class, () -> service.logout("valid-refresh"));
    }
}
