package vn.skillbridge.users.application;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.skillbridge.users.domain.Education;

public interface EducationRepository {
    /** Newest period first; entries without a period last. */
    List<Education> findByUserId(UUID userId);
    Optional<Education> findOwned(UUID userId, UUID educationId);
    int countByUserId(UUID userId);
    void save(Education education);
    void delete(Education education);
}
