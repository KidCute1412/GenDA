package vn.skillbridge.users.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import vn.skillbridge.users.application.ContributorProfileRepository;
import vn.skillbridge.users.domain.BackgroundType;
import vn.skillbridge.users.domain.ContributorProfile;

@Repository
class JpaContributorProfileRepositoryAdapter implements ContributorProfileRepository {
    private final SpringDataContributorProfileRepository repository;

    JpaContributorProfileRepositoryAdapter(SpringDataContributorProfileRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<ContributorProfile> findByUserId(UUID userId) {
        return repository.findById(userId).map(JpaContributorProfileRepositoryAdapter::toDomain);
    }

    @Override
    public void save(ContributorProfile profile) {
        ContributorProfileJpaEntity entity = repository.findById(profile.userId()).orElse(null);
        if (entity == null) {
            repository.save(new ContributorProfileJpaEntity(profile.userId(), profile.backgroundType().name(),
                    profile.specialization(), profile.skillCodes(), profile.createdAt(), profile.updatedAt()));
            return;
        }
        entity.backgroundType = profile.backgroundType().name();
        entity.specialization = profile.specialization();
        entity.updatedAt = profile.updatedAt();
        if (!entity.skillCodes.equals(profile.skillCodes())) {
            // Reordering rewrites rows in place and would briefly duplicate (user_id, skill_code): delete first.
            entity.skillCodes.clear();
            repository.flush();
            entity.skillCodes.addAll(profile.skillCodes());
        }
    }

    private static ContributorProfile toDomain(ContributorProfileJpaEntity entity) {
        return new ContributorProfile(entity.userId, BackgroundType.valueOf(entity.backgroundType),
                entity.specialization, entity.skillCodes, entity.createdAt, entity.updatedAt);
    }
}
