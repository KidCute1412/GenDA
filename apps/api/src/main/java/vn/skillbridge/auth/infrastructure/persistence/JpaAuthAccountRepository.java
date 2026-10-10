package vn.skillbridge.auth.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.skillbridge.auth.application.AuthAccountRepository;
import vn.skillbridge.auth.domain.AuthUser;
import vn.skillbridge.auth.domain.UserRole;

@Component
class JpaAuthAccountRepository implements AuthAccountRepository {
    private final AuthUserJpaRepository repository;

    JpaAuthAccountRepository(AuthUserJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<AuthUser> findByEmail(String normalizedEmail) {
        return repository.findByEmail(normalizedEmail).map(JpaAuthAccountRepository::toDomain);
    }

    @Override
    public Optional<AuthUser> findById(UUID id) {
        return repository.findById(id).map(JpaAuthAccountRepository::toDomain);
    }

    @Override
    public void create(AuthUser user, String taxCode, String companyWebsite) {
        repository.save(new AuthUserJpaEntity(user.id(), user.email(), user.passwordHash(), user.displayName(),
                user.role().name(), user.emailVerified(), user.studentVerificationStatus(), user.smeApprovalStatus(),
                taxCode, companyWebsite, user.active()));
    }

    private static AuthUser toDomain(AuthUserJpaEntity entity) {
        return new AuthUser(entity.id, entity.email, entity.passwordHash, entity.displayName,
                UserRole.valueOf(entity.role), entity.emailVerified, entity.studentVerificationStatus,
                entity.smeApprovalStatus, entity.active);
    }
}
