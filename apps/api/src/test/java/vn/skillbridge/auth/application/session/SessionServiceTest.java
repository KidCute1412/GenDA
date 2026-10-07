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
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.skillbridge.auth.application.account.AuthUserRepository;
import vn.skillbridge.auth.application.AuthException;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.account.UserRole;
import vn.skillbridge.auth.domain.session.RefreshSession;

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

    @Test
    void revokesRefreshSessionWhenAccountIsPendingEmailVerification() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        var refreshSession = new RefreshSession(sessionId, userId, "fingerprint", false,
                NOW.plus(Duration.ofHours(1)), null, NOW.minus(Duration.ofHours(1)), NOW.minus(Duration.ofMinutes(1)));
        var pendingUser = new AuthUser(userId, "pending@example.com", "hash", "Pending", UserRole.CONTRIBUTOR,
                false, AccountState.PENDING_EMAIL_VERIFICATION, null);
        when(tokens.parseRefreshToken("valid-refresh"))
                .thenReturn(new TokenService.RefreshTokenClaims(userId, sessionId));
        when(tokens.fingerprint("valid-refresh")).thenReturn("fingerprint");
        when(sessions.findById(sessionId)).thenReturn(Optional.of(refreshSession));
        when(accounts.findById(userId)).thenReturn(Optional.of(pendingUser));

        assertThrows(AuthException.class, () -> service.refresh("valid-refresh"));

        verify(sessions).revoke(sessionId, NOW);
    }
}
