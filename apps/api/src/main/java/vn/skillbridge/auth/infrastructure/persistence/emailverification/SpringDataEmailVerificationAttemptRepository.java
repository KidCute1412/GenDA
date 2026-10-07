package vn.skillbridge.auth.infrastructure.persistence.emailverification;

import java.time.Instant;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataEmailVerificationAttemptRepository
        extends JpaRepository<EmailVerificationAttemptJpaEntity, UUID> {
    long countByRequestSourceHashAndSuccessfulFalseAndAttemptedAtGreaterThanEqual(
            String requestSourceHash, Instant attemptedAt);
}
