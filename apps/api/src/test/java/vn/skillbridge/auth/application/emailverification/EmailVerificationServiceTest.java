package vn.skillbridge.auth.application.emailverification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
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
import vn.skillbridge.auth.application.AuthException;
import vn.skillbridge.auth.application.account.AuthUserRepository;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.account.UserRole;
import vn.skillbridge.auth.domain.emailverification.EmailVerificationChallenge;

class EmailVerificationServiceTest {
    private static final Instant NOW = Instant.parse("2026-10-07T10:00:00Z");
    private final AuthUserRepository accounts = mock(AuthUserRepository.class);
    private final EmailVerificationRepository challenges = mock(EmailVerificationRepository.class);
    private final OtpGenerator codes = mock(OtpGenerator.class);
    private final OtpHashService hashes = mock(OtpHashService.class);
    private final RequestSourceHasher sourceHasher = mock(RequestSourceHasher.class);
    private final EmailSender emails = mock(EmailSender.class);
    private EmailVerificationService service;

    @BeforeEach
    void setUp() {
        when(sourceHasher.hash(any())).thenReturn("a".repeat(64));
        service = new EmailVerificationService(accounts, challenges, codes, hashes, sourceHasher, emails,
                new EmailVerificationSettings(Duration.ofMinutes(10), Duration.ofSeconds(60),
                        Duration.ofHours(1), Duration.ofMinutes(15), 5, 10, 20),
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void issuesOnlyTheHashAndSendsTheRawCode() {
        AuthUser user = pending(UserRole.CONTRIBUTOR);
        when(challenges.findCurrentForUpdate(user.id())).thenReturn(Optional.empty());
        when(codes.generateSixDigitCode()).thenReturn("123456");
        when(hashes.hash("123456")).thenReturn("stored-hash");

        service.issueInitial(user, "127.0.0.1");

        ArgumentCaptor<EmailVerificationChallenge> captor = ArgumentCaptor.forClass(EmailVerificationChallenge.class);
        verify(challenges).create(captor.capture());
        assertThat(captor.getValue().otpHash()).isEqualTo("stored-hash").doesNotContain("123456");
        assertThat(captor.getValue().expiresAt()).isEqualTo(NOW.plus(Duration.ofMinutes(10)));
        verify(emails).sendVerificationCode(user.email(), "123456", captor.getValue().expiresAt());
    }

    @Test
    void confirmsContributorAndConsumesTheChallenge() {
        AuthUser pending = pending(UserRole.CONTRIBUTOR);
        AuthUser active = withState(pending, AccountState.ACTIVE, true);
        EmailVerificationChallenge challenge = challenge(pending.id(), 0, NOW.plusSeconds(600), NOW.minusSeconds(1));
        when(accounts.findByEmail(pending.email())).thenReturn(Optional.of(pending));
        when(accounts.findById(pending.id())).thenReturn(Optional.of(active));
        when(challenges.findCurrentForUpdate(pending.id())).thenReturn(Optional.of(challenge));
        when(hashes.matches("123456", challenge.otpHash())).thenReturn(true);

        AuthUser result = service.confirm(pending.email(), "123456", "127.0.0.1");

        assertThat(result).isEqualTo(active);
        verify(accounts).markEmailVerified(pending.id(), AccountState.ACTIVE);
        verify(challenges).saveAndFlush(challenge.consume(NOW));
    }

    @Test
    void confirmsSmeEmailWithoutBypassingBusinessApproval() {
        AuthUser pending = pending(UserRole.SME);
        AuthUser verified = withState(pending, AccountState.EMAIL_VERIFIED, true);
        EmailVerificationChallenge challenge = challenge(pending.id(), 0, NOW.plusSeconds(600), NOW.minusSeconds(1));
        when(accounts.findByEmail(pending.email())).thenReturn(Optional.of(pending));
        when(accounts.findById(pending.id())).thenReturn(Optional.of(verified));
        when(challenges.findCurrentForUpdate(pending.id())).thenReturn(Optional.of(challenge));
        when(hashes.matches("123456", challenge.otpHash())).thenReturn(true);

        service.confirm(pending.email(), "123456", "127.0.0.1");

        verify(accounts).markEmailVerified(pending.id(), AccountState.EMAIL_VERIFIED);
        assertThat(verified.smeApprovalStatus()).isEqualTo("PENDING");
    }

    @Test
    void recordsIncorrectAttemptsAndLocksTheFifthAttempt() {
        AuthUser user = pending(UserRole.CONTRIBUTOR);
        EmailVerificationChallenge challenge = challenge(user.id(), 4, NOW.plusSeconds(600), NOW.minusSeconds(1));
        when(accounts.findByEmail(user.email())).thenReturn(Optional.of(user));
        when(challenges.findCurrentForUpdate(user.id())).thenReturn(Optional.of(challenge));

        assertThatThrownBy(() -> service.confirm(user.email(), "000000", "127.0.0.1"))
                .isInstanceOf(AuthException.class)
                .extracting(exception -> ((AuthException) exception).code())
                .isEqualTo("OTP_ATTEMPTS_EXCEEDED");
        verify(challenges).saveAndFlush(challenge.recordFailedAttempt());
    }

    @Test
    void rejectsExpiredAndSupersededCodes() {
        AuthUser user = pending(UserRole.CONTRIBUTOR);
        when(accounts.findByEmail(user.email())).thenReturn(Optional.of(user));
        when(challenges.findCurrentForUpdate(user.id()))
                .thenReturn(Optional.of(challenge(user.id(), 0, NOW, NOW.minusSeconds(1))))
                .thenReturn(Optional.empty());

        assertCode(() -> service.confirm(user.email(), "123456", "127.0.0.1"), "OTP_EXPIRED");
        assertCode(() -> service.confirm(user.email(), "123456", "127.0.0.1"), "OTP_INVALID");
    }

    @Test
    void enforcesResendCooldown() {
        AuthUser user = pending(UserRole.CONTRIBUTOR);
        when(accounts.findByEmail(user.email())).thenReturn(Optional.of(user));
        when(challenges.findCurrentForUpdate(user.id()))
                .thenReturn(Optional.of(challenge(user.id(), 0, NOW.plusSeconds(600), NOW.plusSeconds(30))));

        assertCode(() -> service.resend(user.email(), "127.0.0.1"), "OTP_RESEND_TOO_SOON");
    }

    @Test
    void rateLimitsConfirmationFailuresByHashedRequestSource() {
        when(challenges.countFailedAttemptsBySourceSince(eq("a".repeat(64)), any())).thenReturn(20L);

        assertCode(() -> service.confirm("user@example.com", "123456", "127.0.0.1"), "OTP_RATE_LIMITED");
    }

    @Test
    void returnsWithoutRevealingAnUnknownEmailDuringResend() {
        when(accounts.findByEmail("missing@example.com")).thenReturn(Optional.empty());
        service.resend("missing@example.com", "127.0.0.1");
    }

    private static void assertCode(Runnable action, String code) {
        assertThatThrownBy(action::run)
                .isInstanceOf(AuthException.class)
                .extracting(exception -> ((AuthException) exception).code())
                .isEqualTo(code);
    }

    private static AuthUser pending(UserRole role) {
        return new AuthUser(UUID.randomUUID(), role.name().toLowerCase() + "@example.com", "hash", "User", role,
                false, AccountState.PENDING_EMAIL_VERIFICATION, role == UserRole.SME ? "PENDING" : null);
    }

    private static AuthUser withState(AuthUser user, AccountState state, boolean verified) {
        return new AuthUser(user.id(), user.email(), user.passwordHash(), user.displayName(), user.role(), verified,
                state, user.smeApprovalStatus());
    }

    private static EmailVerificationChallenge challenge(UUID userId, int failedAttempts, Instant expiresAt,
            Instant resendAvailableAt) {
        return new EmailVerificationChallenge(UUID.randomUUID(), userId, "stored-hash", expiresAt, failedAttempts,
                5, resendAvailableAt, null, null, "a".repeat(64), NOW.minusSeconds(60));
    }
}
