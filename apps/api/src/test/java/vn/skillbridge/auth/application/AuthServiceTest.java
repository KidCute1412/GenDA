package vn.skillbridge.auth.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
import org.mockito.ArgumentCaptor;
import vn.skillbridge.auth.domain.AuthUser;
import vn.skillbridge.auth.domain.UserRole;

class AuthServiceTest {
    private static final Instant NOW = Instant.parse("2026-10-07T00:00:00Z");
    private static final UUID USER_ID = UUID.fromString("40000000-0000-0000-0000-000000000001");
    private final AuthAccountRepository accounts = mock(AuthAccountRepository.class);
    private final RefreshSessionStore sessions = mock(RefreshSessionStore.class);
    private final PasswordVerifier passwords = mock(PasswordVerifier.class);
    private final PasswordHasher passwordHasher = mock(PasswordHasher.class);
    private final TokenService tokens = mock(TokenService.class);
    private AuthService service;
    private AuthUser user;

    @BeforeEach
    void setUp() {
        service = new AuthService(accounts, sessions, passwords, passwordHasher, tokens,
                Clock.fixed(NOW, ZoneOffset.UTC),
                new AuthService.AuthSettings(Duration.ofMinutes(5), Duration.ofHours(24), Duration.ofDays(7)));
        user = new AuthUser(USER_ID, "student@example.com", "hash", "Student", UserRole.STUDENT,
                true, "VERIFIED", null, true);
        when(accounts.findByEmail("student@example.com")).thenReturn(Optional.of(user));
        when(passwords.matches("Password@1", "hash")).thenReturn(true);
        when(tokens.issueAccessToken(eq(user), eq(NOW), eq(Duration.ofMinutes(5)))).thenReturn("access");
        when(tokens.issueRefreshToken(eq(user), any(UUID.class), eq(NOW), any(Duration.class))).thenReturn("refresh");
        when(tokens.fingerprint("refresh")).thenReturn("fingerprint");
        when(passwordHasher.hash("Password@1")).thenReturn("new-hash");
    }

    @Test
    void usesTwentyFourHourRefreshByDefault() {
        AuthResult result = service.login("STUDENT@example.com", "Password@1", false);

        assertThat(result.accessToken()).isEqualTo("access");
        assertThat(result.refreshExpiresAt()).isEqualTo(NOW.plus(Duration.ofHours(24)));
        ArgumentCaptor<RefreshSession> session = ArgumentCaptor.forClass(RefreshSession.class);
        verify(sessions).create(session.capture());
        assertThat(session.getValue().rememberDevice()).isFalse();
        assertThat(session.getValue().expiresAt()).isEqualTo(NOW.plus(Duration.ofHours(24)));
    }

    @Test
    void usesSevenDayRefreshWhenDeviceIsRemembered() {
        AuthResult result = service.login("student@example.com", "Password@1", true);

        assertThat(result.refreshExpiresAt()).isEqualTo(NOW.plus(Duration.ofDays(7)));
        verify(tokens).issueRefreshToken(eq(user), any(UUID.class), eq(NOW), eq(Duration.ofDays(7)));
    }

    @Test
    void rejectsInvalidCredentialsWithoutRevealingWhichFieldFailed() {
        when(passwords.matches("wrong-password", "hash")).thenReturn(false);

        assertThatThrownBy(() -> service.login("student@example.com", "wrong-password", false))
                .isInstanceOf(AuthException.class)
                .extracting(exception -> ((AuthException) exception).code())
                .isEqualTo("INVALID_CREDENTIALS");
    }

    @Test
    void registersStudentAndIssuesSession() {
        RegistrationResult result = service.register(new RegistrationCommand("New Student",
                "NEW.Student@example.com", "Password@1", UserRole.STUDENT, null, null));

        assertThat(result.user().email()).isEqualTo("new.student@example.com");
        assertThat(result.user().emailVerified()).isFalse();
        assertThat(result.user().studentVerificationStatus()).isEqualTo("UNVERIFIED");
        assertThat(result.sessionIssued()).isTrue();
        verify(accounts).create(any(AuthUser.class), eq(null), eq(null));
        verify(sessions).create(any(RefreshSession.class));
    }

    @Test
    void registersSmeAsPendingWithoutSession() {
        RegistrationResult result = service.register(new RegistrationCommand("New Company",
                "company@example.com", "Password@1", UserRole.SME, "0316789012001", null));

        assertThat(result.user().smeApprovalStatus()).isEqualTo("PENDING");
        assertThat(result.sessionIssued()).isFalse();
        verify(accounts).create(any(AuthUser.class), eq("0316789012-001"), eq(null));
    }

    @Test
    void rejectsSmeWithoutValidIdentity() {
        assertThatThrownBy(() -> service.register(new RegistrationCommand("New Company",
                "company@example.com", "Password@1", UserRole.SME, null, "invalid")))
                .isInstanceOf(AuthException.class)
                .extracting(exception -> ((AuthException) exception).code())
                .isEqualTo("SME_IDENTITY_REQUIRED");
    }

    @Test
    void rejectsAnAlreadyRegisteredEmail() {
        assertThatThrownBy(() -> service.register(new RegistrationCommand("Student",
                "STUDENT@example.com", "Password@1", UserRole.STUDENT, null, null)))
                .isInstanceOf(AuthException.class)
                .extracting(exception -> ((AuthException) exception).code())
                .isEqualTo("EMAIL_ALREADY_REGISTERED");
    }

    @Test
    void revokesRefreshSessionOnLogout() {
        UUID sessionId = UUID.fromString("50000000-0000-0000-0000-000000000001");
        when(tokens.parseRefreshToken("valid-refresh"))
                .thenReturn(new TokenService.RefreshTokenClaims(USER_ID, sessionId));

        service.logout("valid-refresh");

        verify(sessions).revoke(sessionId, NOW);
    }

    @Test
    void treatsMissingRefreshCookieAsIdempotentLogout() {
        service.logout(null);

        verifyNoInteractions(sessions);
    }
}
