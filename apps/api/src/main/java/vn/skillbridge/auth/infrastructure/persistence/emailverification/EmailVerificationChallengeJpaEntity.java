package vn.skillbridge.auth.infrastructure.persistence.emailverification;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "auth_email_verification_challenges")
class EmailVerificationChallengeJpaEntity {
    @Id UUID id;
    @Column(name = "user_id", nullable = false) UUID userId;
    @Column(name = "purpose", nullable = false, length = 32) String purpose;
    @Column(name = "otp_hash", nullable = false, length = 100) String otpHash;
    @Column(name = "expires_at", nullable = false) Instant expiresAt;
    @Column(name = "failed_attempts", nullable = false) int failedAttempts;
    @Column(name = "max_attempts", nullable = false) int maxAttempts;
    @Column(name = "resend_available_at", nullable = false) Instant resendAvailableAt;
    @Column(name = "consumed_at") Instant consumedAt;
    @Column(name = "invalidated_at") Instant invalidatedAt;
    @Column(name = "request_source_hash", nullable = false, length = 64) String requestSourceHash;
    @Column(name = "created_at", nullable = false) Instant createdAt;

    protected EmailVerificationChallengeJpaEntity() {}

    EmailVerificationChallengeJpaEntity(UUID id, UUID userId, String otpHash, Instant expiresAt,
            int failedAttempts, int maxAttempts, Instant resendAvailableAt, Instant consumedAt,
            Instant invalidatedAt, String requestSourceHash, Instant createdAt) {
        this.id = id;
        this.userId = userId;
        this.purpose = "EMAIL_VERIFICATION";
        this.otpHash = otpHash;
        this.expiresAt = expiresAt;
        this.failedAttempts = failedAttempts;
        this.maxAttempts = maxAttempts;
        this.resendAvailableAt = resendAvailableAt;
        this.consumedAt = consumedAt;
        this.invalidatedAt = invalidatedAt;
        this.requestSourceHash = requestSourceHash;
        this.createdAt = createdAt;
    }
}
