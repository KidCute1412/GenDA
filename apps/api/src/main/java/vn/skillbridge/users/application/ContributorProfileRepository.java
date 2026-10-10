package vn.skillbridge.users.application;

import java.util.Optional;
import java.util.UUID;
import vn.skillbridge.users.domain.ContributorProfile;

public interface ContributorProfileRepository {
    Optional<ContributorProfile> findByUserId(UUID userId);
    void save(ContributorProfile profile);
}
