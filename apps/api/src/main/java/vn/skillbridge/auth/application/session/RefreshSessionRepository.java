package vn.skillbridge.auth.application.session;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import vn.skillbridge.auth.domain.session.RefreshSession;

public interface RefreshSessionRepository {
    Optional<RefreshSession> findById(UUID id);
    void create(RefreshSession session);
    void rotate(UUID id, String tokenFingerprint, Instant expiresAt, Instant usedAt);
    void revoke(UUID id, Instant revokedAt);
}
