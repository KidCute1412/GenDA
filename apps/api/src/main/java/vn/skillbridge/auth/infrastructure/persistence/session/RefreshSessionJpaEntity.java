package vn.skillbridge.auth.infrastructure.persistence.session;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "auth_refresh_sessions")
class RefreshSessionJpaEntity {
    @Id UUID id;
    @Column(name = "user_id", nullable = false) UUID userId;
    @Column(name = "token_fingerprint", nullable = false, unique = true, length = 64) String tokenFingerprint;
    @Column(name = "remember_device", nullable = false) boolean rememberDevice;
    @Column(name = "expires_at", nullable = false) Instant expiresAt;
    @Column(name = "revoked_at") Instant revokedAt;
    @Column(name = "created_at", nullable = false) Instant createdAt;
    @Column(name = "last_used_at", nullable = false) Instant lastUsedAt;

    protected RefreshSessionJpaEntity() {}

    RefreshSessionJpaEntity(UUID id, UUID userId, String tokenFingerprint, boolean rememberDevice,
            Instant expiresAt, Instant revokedAt, Instant createdAt, Instant lastUsedAt) {
        this.id = id;
        this.userId = userId;
        this.tokenFingerprint = tokenFingerprint;
        this.rememberDevice = rememberDevice;
        this.expiresAt = expiresAt;
        this.revokedAt = revokedAt;
        this.createdAt = createdAt;
        this.lastUsedAt = lastUsedAt;
    }
}
