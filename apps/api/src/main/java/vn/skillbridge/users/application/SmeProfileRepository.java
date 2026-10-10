package vn.skillbridge.users.application;

import java.util.Optional;
import java.util.UUID;
import vn.skillbridge.users.domain.SmeProfile;

public interface SmeProfileRepository {
    Optional<SmeProfile> findByUserId(UUID userId);
    void save(SmeProfile profile);
}
