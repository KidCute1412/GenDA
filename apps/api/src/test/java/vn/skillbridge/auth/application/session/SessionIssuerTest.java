package vn.skillbridge.auth.application.session;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.account.UserRole;
import vn.skillbridge.auth.domain.session.RefreshSession;

class SessionIssuerTest {
    private static final Instant NOW = Instant.parse("2026-10-07T00:00:00Z");
    private final RefreshSessionRepository sessions = mock(RefreshSessionRepository.class);
    private final TokenService tokens = mock(TokenService.class);
    private SessionIssuer issuer;
    private AuthUser user;

    @BeforeEach
    void setUp() {
        issuer = new SessionIssuer(sessions, tokens, Clock.fixed(NOW, ZoneOffset.UTC),
                new AuthSettings(Duration.ofMinutes(5), Duration.ofHours(24), Duration.ofDays(7)));
        user = new AuthUser(UUID.randomUUID(), "student@example.com", "hash", "Student", UserRole.STUDENT,
                true, "VERIFIED", null, true);
        when(tokens.issueAccessToken(eq(user), eq(NOW), eq(Duration.ofMinutes(5)))).thenReturn("access");
        when(tokens.issueRefreshToken(eq(user), any(UUID.class), eq(NOW), any(Duration.class))).thenReturn("refresh");
        when(tokens.fingerprint("refresh")).thenReturn("fingerprint");
    }

    @Test
    void usesTwentyFourHourRefreshByDefault() {
        AuthResult result = issuer.issue(user, false);

        assertThat(result.refreshExpiresAt()).isEqualTo(NOW.plus(Duration.ofHours(24)));
        ArgumentCaptor<RefreshSession> session = ArgumentCaptor.forClass(RefreshSession.class);
        verify(sessions).create(session.capture());
        assertThat(session.getValue().rememberDevice()).isFalse();
        assertThat(session.getValue().expiresAt()).isEqualTo(NOW.plus(Duration.ofHours(24)));
    }

    @Test
    void usesSevenDayRefreshWhenDeviceIsRemembered() {
        AuthResult result = issuer.issue(user, true);

        assertThat(result.refreshExpiresAt()).isEqualTo(NOW.plus(Duration.ofDays(7)));
        verify(tokens).issueRefreshToken(eq(user), any(UUID.class), eq(NOW), eq(Duration.ofDays(7)));
    }
}
