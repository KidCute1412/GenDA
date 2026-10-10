package vn.skillbridge.auth.infrastructure.persistence;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.skillbridge.auth.application.RefreshSession;
import vn.skillbridge.auth.application.RefreshSessionStore;

@Component
class JpaRefreshSessionStore implements RefreshSessionStore {
    private final RefreshSessionJpaRepository repository;

    JpaRefreshSessionStore(RefreshSessionJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<RefreshSession> findById(UUID id) {
        return repository.findById(id).map(JpaRefreshSessionStore::toModel);
    }

    @Override
    public void create(RefreshSession session) {
        repository.save(new RefreshSessionJpaEntity(session.id(), session.userId(), session.tokenFingerprint(),
                session.rememberDevice(), session.expiresAt(), session.revokedAt(), session.createdAt(), session.lastUsedAt()));
    }

    @Override
    public void rotate(UUID id, String tokenFingerprint, Instant expiresAt, Instant usedAt) {
        RefreshSessionJpaEntity entity = repository.findById(id).orElseThrow();
        entity.tokenFingerprint = tokenFingerprint;
        entity.expiresAt = expiresAt;
        entity.lastUsedAt = usedAt;
        repository.save(entity);
    }

    @Override
    public void revoke(UUID id, Instant revokedAt) {
        repository.findById(id).ifPresent(entity -> {
            entity.revokedAt = revokedAt;
            repository.save(entity);
        });
    }

    private static RefreshSession toModel(RefreshSessionJpaEntity entity) {
        return new RefreshSession(entity.id, entity.userId, entity.tokenFingerprint, entity.rememberDevice,
                entity.expiresAt, entity.revokedAt, entity.createdAt, entity.lastUsedAt);
    }
}
