package vn.skillbridge.auth.application.emailverification;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import vn.skillbridge.auth.domain.emailverification.EmailVerificationChallenge;

public interface EmailVerificationRepository {
    Optional<EmailVerificationChallenge> findCurrentForUpdate(UUID userId);
    void create(EmailVerificationChallenge challenge);
    void saveAndFlush(EmailVerificationChallenge challenge);
    long countCreatedBySourceSince(String requestSourceHash, Instant since);
    long countFailedAttemptsBySourceSince(String requestSourceHash, Instant since);
    void recordAttempt(UUID challengeId, String requestSourceHash, boolean successful, Instant attemptedAt);
}
