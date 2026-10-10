package vn.skillbridge.auth.infrastructure.persistence.emailverification;

import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

interface SpringDataEmailVerificationRepository extends JpaRepository<EmailVerificationChallengeJpaEntity, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<EmailVerificationChallengeJpaEntity>
            findFirstByUserIdAndPurposeAndConsumedAtIsNullAndInvalidatedAtIsNullOrderByCreatedAtDesc(
                    UUID userId, String purpose);

    long countByRequestSourceHashAndCreatedAtGreaterThanEqual(String requestSourceHash, Instant createdAt);
}
