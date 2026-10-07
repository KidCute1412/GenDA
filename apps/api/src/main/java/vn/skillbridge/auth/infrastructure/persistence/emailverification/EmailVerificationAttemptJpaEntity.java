package vn.skillbridge.auth.infrastructure.persistence.emailverification;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "auth_email_verification_attempts")
class EmailVerificationAttemptJpaEntity {
    @Id UUID id;
    @Column(name = "challenge_id", nullable = false) UUID challengeId;
    @Column(name = "request_source_hash", nullable = false, length = 64) String requestSourceHash;
    @Column(nullable = false) boolean successful;
    @Column(name = "attempted_at", nullable = false) Instant attemptedAt;

    protected EmailVerificationAttemptJpaEntity() {}

    EmailVerificationAttemptJpaEntity(UUID id, UUID challengeId, String requestSourceHash,
            boolean successful, Instant attemptedAt) {
        this.id = id;
        this.challengeId = challengeId;
        this.requestSourceHash = requestSourceHash;
        this.successful = successful;
        this.attemptedAt = attemptedAt;
    }
}
