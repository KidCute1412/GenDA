package vn.skillbridge.applications.application;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import vn.skillbridge.applications.domain.Application;

public interface ApplicationRepository {
    Optional<Application> findById(UUID applicationId);

    /** Locks the application until the transaction ends, serializing withdrawal against acceptance. */
    Optional<Application> findByIdForUpdate(UUID applicationId);

    /** Newest first. */
    List<Application> findByContributor(UUID contributorId);

    /** Oldest first, locked: used when one acceptance decides every application of the project. */
    List<Application> findByProjectForUpdate(String projectId);

    /** Oldest first. */
    List<Application> findByProject(String projectId);

    boolean hasActive(String projectId, UUID contributorId);

    Map<String, Counts> countByProjects(Collection<String> projectIds);

    /**
     * Inserts or updates. A concurrent duplicate active application violates the unique index and surfaces as
     * {@link DuplicateApplicationException}.
     */
    void save(Application application);

    record Counts(int open, int total) {
    }

    class DuplicateApplicationException extends RuntimeException {
        public DuplicateApplicationException(Throwable cause) {
            super(cause);
        }
    }
}
