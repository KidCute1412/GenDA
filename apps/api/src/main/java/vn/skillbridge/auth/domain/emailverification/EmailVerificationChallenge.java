package vn.skillbridge.auth.domain.emailverification;

import java.time.Instant;
import java.util.UUID;

public record EmailVerificationChallenge(
        UUID id,
        UUID userId,
        String otpHash,
        Instant expiresAt,
        int failedAttempts,
        int maxAttempts,
        Instant resendAvailableAt,
        Instant consumedAt,
        Instant invalidatedAt,
        String requestSourceHash,
        Instant createdAt) {

    public boolean isExpired(Instant now) {
        return !now.isBefore(expiresAt);
    }

    public boolean attemptsExceeded() {
        return failedAttempts >= maxAttempts;
    }

    public boolean isUsable(Instant now) {
        return consumedAt == null && invalidatedAt == null && !isExpired(now) && !attemptsExceeded();
    }

    public EmailVerificationChallenge recordFailedAttempt() {
        return new EmailVerificationChallenge(id, userId, otpHash, expiresAt, failedAttempts + 1, maxAttempts,
                resendAvailableAt, consumedAt, invalidatedAt, requestSourceHash, createdAt);
    }

    public EmailVerificationChallenge consume(Instant now) {
        return new EmailVerificationChallenge(id, userId, otpHash, expiresAt, failedAttempts, maxAttempts,
                resendAvailableAt, now, invalidatedAt, requestSourceHash, createdAt);
    }

    public EmailVerificationChallenge invalidate(Instant now) {
        return new EmailVerificationChallenge(id, userId, otpHash, expiresAt, failedAttempts, maxAttempts,
                resendAvailableAt, consumedAt, now, requestSourceHash, createdAt);
    }
}
