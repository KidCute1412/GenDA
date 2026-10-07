package vn.skillbridge.auth.application.emailverification;

import java.time.Clock;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.auth.application.AuthException;
import vn.skillbridge.auth.application.account.AuthUserRepository;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.account.UserRole;
import vn.skillbridge.auth.domain.emailverification.EmailVerificationChallenge;

@Service
public class EmailVerificationService {
    private static final Logger log = LoggerFactory.getLogger(EmailVerificationService.class);
    private final AuthUserRepository accounts;
    private final EmailVerificationRepository challenges;
    private final OtpGenerator codes;
    private final OtpHashService hashes;
    private final RequestSourceHasher sourceHasher;
    private final EmailSender emails;
    private final EmailVerificationSettings settings;
    private final Clock clock;

    public EmailVerificationService(AuthUserRepository accounts, EmailVerificationRepository challenges,
            OtpGenerator codes, OtpHashService hashes, RequestSourceHasher sourceHasher, EmailSender emails,
            EmailVerificationSettings settings, Clock clock) {
        this.accounts = accounts;
        this.challenges = challenges;
        this.codes = codes;
        this.hashes = hashes;
        this.sourceHasher = sourceHasher;
        this.emails = emails;
        this.settings = settings;
        this.clock = clock;
    }

    @Transactional
    public void issueInitial(AuthUser user, String requestSource) {
        issue(user, requestSource, false);
    }

    @Transactional
    public void resend(String email, String requestSource) {
        String normalizedEmail = normalize(email);
        AuthUser user = accounts.findByEmail(normalizedEmail).orElse(null);
        if (user == null || user.emailVerified() || user.accountState() != AccountState.PENDING_EMAIL_VERIFICATION) {
            return;
        }
        issue(user, requestSource, true);
    }

    @Transactional(noRollbackFor = AuthException.class)
    public AuthUser confirm(String email, String code, String requestSource) {
        Instant now = clock.instant();
        String sourceHash = sourceHasher.hash(requestSource);
        long recentFailedAttempts = challenges.countFailedAttemptsBySourceSince(
                sourceHash, now.minus(settings.confirmationSourceRateWindow()));
        if (recentFailedAttempts >= settings.maxConfirmAttemptsPerSourceWindow()) {
            throw new AuthException("OTP_RATE_LIMITED", "Too many verification attempts were submitted");
        }
        String normalizedEmail = normalize(email);
        AuthUser user = accounts.findByEmail(normalizedEmail)
                .orElseThrow(() -> invalidCode());
        if (user.emailVerified() || user.accountState() != AccountState.PENDING_EMAIL_VERIFICATION) {
            throw invalidCode();
        }

        EmailVerificationChallenge challenge = challenges.findCurrentForUpdate(user.id())
                .orElseThrow(() -> invalidCode());
        if (challenge.isExpired(now)) {
            throw new AuthException("OTP_EXPIRED", "The verification code has expired");
        }
        if (challenge.attemptsExceeded()) {
            throw new AuthException("OTP_ATTEMPTS_EXCEEDED", "The verification code is locked after too many attempts");
        }
        if (!challenge.isUsable(now)) {
            throw invalidCode();
        }
        if (!hashes.matches(code, challenge.otpHash())) {
            challenges.recordAttempt(challenge.id(), sourceHash, false, now);
            EmailVerificationChallenge failed = challenge.recordFailedAttempt();
            challenges.saveAndFlush(failed);
            if (failed.attemptsExceeded()) {
                throw new AuthException("OTP_ATTEMPTS_EXCEEDED", "The verification code is locked after too many attempts");
            }
            throw invalidCode();
        }

        challenges.recordAttempt(challenge.id(), sourceHash, true, now);
        challenges.saveAndFlush(challenge.consume(now));
        AccountState nextState = user.role() == UserRole.SME ? AccountState.EMAIL_VERIFIED : AccountState.ACTIVE;
        accounts.markEmailVerified(user.id(), nextState);
        return accounts.findById(user.id()).orElseThrow();
    }

    private void issue(AuthUser user, String requestSource, boolean enforceCooldown) {
        Instant now = clock.instant();
        String sourceHash = sourceHasher.hash(requestSource);
        long recentSends = challenges.countCreatedBySourceSince(sourceHash, now.minus(settings.sourceRateWindow()));
        if (recentSends >= settings.maxSendsPerSourceWindow()) {
            throw new AuthException("OTP_RATE_LIMITED", "Too many verification codes were requested");
        }

        var current = challenges.findCurrentForUpdate(user.id());
        if (enforceCooldown && current.isPresent() && now.isBefore(current.get().resendAvailableAt())) {
            throw new AuthException("OTP_RESEND_TOO_SOON", "Wait before requesting another verification code");
        }
        current.ifPresent(challenge -> challenges.saveAndFlush(challenge.invalidate(now)));

        String code = codes.generateSixDigitCode();
        EmailVerificationChallenge challenge = new EmailVerificationChallenge(
                UUID.randomUUID(), user.id(), hashes.hash(code), now.plus(settings.otpTtl()), 0,
                settings.maxAttempts(), now.plus(settings.resendCooldown()), null, null, sourceHash, now);
        challenges.create(challenge);
        try {
            emails.sendVerificationCode(user.email(), code, challenge.expiresAt());
        } catch (RuntimeException exception) {
            log.warn("Verification email delivery failed for challenge {} ({})",
                    challenge.id(), exception.getClass().getSimpleName());
            throw new AuthException("EMAIL_DELIVERY_FAILED", "The verification email could not be sent");
        }
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static AuthException invalidCode() {
        return new AuthException("OTP_INVALID", "The verification code is invalid");
    }
}
