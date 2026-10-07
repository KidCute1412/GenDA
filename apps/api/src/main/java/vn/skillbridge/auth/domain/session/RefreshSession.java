package vn.skillbridge.auth.domain.session;

import java.time.Instant;
import java.util.UUID;

public record RefreshSession(
        UUID id,
        UUID userId,
        String tokenFingerprint,
        boolean rememberDevice,
        Instant expiresAt,
        Instant revokedAt,
        Instant createdAt,
        Instant lastUsedAt) {

    public boolean isUsableAt(Instant now) {
        return revokedAt == null && expiresAt.isAfter(now);
    }
}
