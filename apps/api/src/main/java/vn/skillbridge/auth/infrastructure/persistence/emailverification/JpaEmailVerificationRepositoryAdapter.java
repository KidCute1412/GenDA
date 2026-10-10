package vn.skillbridge.auth.infrastructure.persistence.emailverification;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.skillbridge.auth.application.emailverification.EmailVerificationRepository;
import vn.skillbridge.auth.domain.emailverification.EmailVerificationChallenge;

@Component
class JpaEmailVerificationRepositoryAdapter implements EmailVerificationRepository {
    private static final String PURPOSE = "EMAIL_VERIFICATION";
    private final SpringDataEmailVerificationRepository repository;
    private final SpringDataEmailVerificationAttemptRepository attempts;

    JpaEmailVerificationRepositoryAdapter(SpringDataEmailVerificationRepository repository,
            SpringDataEmailVerificationAttemptRepository attempts) {
        this.repository = repository;
        this.attempts = attempts;
    }

    @Override
    public Optional<EmailVerificationChallenge> findCurrentForUpdate(UUID userId) {
        return repository
                .findFirstByUserIdAndPurposeAndConsumedAtIsNullAndInvalidatedAtIsNullOrderByCreatedAtDesc(
                        userId, PURPOSE)
                .map(JpaEmailVerificationRepositoryAdapter::toDomain);
    }

    @Override
    public void create(EmailVerificationChallenge challenge) {
        repository.save(toEntity(challenge));
    }

    @Override
    public void saveAndFlush(EmailVerificationChallenge challenge) {
        repository.saveAndFlush(toEntity(challenge));
    }

    @Override
    public long countCreatedBySourceSince(String requestSourceHash, Instant since) {
        return repository.countByRequestSourceHashAndCreatedAtGreaterThanEqual(requestSourceHash, since);
    }

    @Override
    public long countFailedAttemptsBySourceSince(String requestSourceHash, Instant since) {
        return attempts.countByRequestSourceHashAndSuccessfulFalseAndAttemptedAtGreaterThanEqual(
                requestSourceHash, since);
    }

    @Override
    public void recordAttempt(UUID challengeId, String requestSourceHash, boolean successful, Instant attemptedAt) {
        attempts.save(new EmailVerificationAttemptJpaEntity(
                UUID.randomUUID(), challengeId, requestSourceHash, successful, attemptedAt));
    }

    private static EmailVerificationChallenge toDomain(EmailVerificationChallengeJpaEntity entity) {
        return new EmailVerificationChallenge(entity.id, entity.userId, entity.otpHash, entity.expiresAt,
                entity.failedAttempts, entity.maxAttempts, entity.resendAvailableAt, entity.consumedAt,
                entity.invalidatedAt, entity.requestSourceHash, entity.createdAt);
    }

    private static EmailVerificationChallengeJpaEntity toEntity(EmailVerificationChallenge challenge) {
        return new EmailVerificationChallengeJpaEntity(challenge.id(), challenge.userId(), challenge.otpHash(),
                challenge.expiresAt(), challenge.failedAttempts(), challenge.maxAttempts(),
                challenge.resendAvailableAt(), challenge.consumedAt(), challenge.invalidatedAt(),
                challenge.requestSourceHash(), challenge.createdAt());
    }
}
