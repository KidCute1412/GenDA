package vn.skillbridge.auth.application;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface RefreshSessionStore {
    Optional<RefreshSession> findById(UUID id);
    void create(RefreshSession session);
    void rotate(UUID id, String tokenFingerprint, Instant expiresAt, Instant usedAt);
    void revoke(UUID id, Instant revokedAt);
}
