package vn.skillbridge.auth.infrastructure.persistence.account;

import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.skillbridge.auth.application.account.AuthUserRepository;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.account.UserRole;

@Component
class JpaAuthUserRepositoryAdapter implements AuthUserRepository {
    private final SpringDataAuthUserRepository repository;

    JpaAuthUserRepositoryAdapter(SpringDataAuthUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<AuthUser> findByEmail(String normalizedEmail) {
        return repository.findByEmail(normalizedEmail).map(JpaAuthUserRepositoryAdapter::toDomain);
    }

    @Override
    public Optional<AuthUser> findById(UUID id) {
        return repository.findById(id).map(JpaAuthUserRepositoryAdapter::toDomain);
    }

    @Override
    public void create(AuthUser user, String taxCode, String companyWebsite) {
        repository.save(new AuthUserJpaEntity(user.id(), user.email(), user.passwordHash(), user.displayName(),
                user.role().name(), user.accountState().name(), user.emailVerified(), user.smeApprovalStatus(),
                taxCode, companyWebsite));
    }

    @Override
    public void markEmailVerified(UUID id, AccountState accountState) {
        AuthUserJpaEntity entity = repository.findById(id).orElseThrow();
        entity.markEmailVerified(accountState.name());
        repository.save(entity);
    }

    @Override
    public void updateDisplayName(UUID id, String displayName) {
        AuthUserJpaEntity entity = repository.findById(id).orElseThrow();
        entity.updateDisplayName(displayName);
        repository.save(entity);
    }

    private static AuthUser toDomain(AuthUserJpaEntity entity) {
        return new AuthUser(entity.id, entity.email, entity.passwordHash, entity.displayName,
                UserRole.valueOf(entity.role), entity.emailVerified, AccountState.valueOf(entity.accountState),
                entity.smeApprovalStatus);
    }
}
