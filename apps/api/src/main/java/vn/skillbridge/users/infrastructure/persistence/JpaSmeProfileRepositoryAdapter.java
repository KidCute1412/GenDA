package vn.skillbridge.users.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import vn.skillbridge.users.application.SmeProfileRepository;
import vn.skillbridge.users.domain.SmeProfile;

@Repository
class JpaSmeProfileRepositoryAdapter implements SmeProfileRepository {
    private final SpringDataSmeProfileRepository profiles;

    JpaSmeProfileRepositoryAdapter(SpringDataSmeProfileRepository profiles) {
        this.profiles = profiles;
    }

    @Override
    public Optional<SmeProfile> findByUserId(UUID userId) {
        return profiles.findById(userId).map(row -> new SmeProfile(row.userId, row.description, row.industry));
    }

    @Override
    public void save(SmeProfile profile) {
        profiles.save(new SmeProfileJpaEntity(profile.userId(), profile.description(), profile.industry()));
    }
}
