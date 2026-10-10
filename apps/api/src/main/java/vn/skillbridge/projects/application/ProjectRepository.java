package vn.skillbridge.projects.application;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.skillbridge.projects.domain.Project;
import vn.skillbridge.projects.domain.ProjectStatus;

/** Owned-project persistence for authoring and moderation; the public catalog uses {@link PublishedProjectRepository}. */
public interface ProjectRepository {
    Optional<Project> findById(String projectId);

    /** Loads the project and locks it until the current transaction ends, serializing state transitions. */
    Optional<Project> findByIdForUpdate(String projectId);

    /**
     * Loads the project under a shared lock: concurrent applications proceed together, but an acceptance (which
     * takes the exclusive lock) waits for them, so nobody applies to a project that has just started.
     */
    Optional<Project> findByIdForShare(String projectId);

    List<Project> findByIds(Collection<String> projectIds);

    List<Project> findByOwner(UUID ownerId);

    /** Oldest submission first, so the review queue is first come, first served. */
    List<Project> findByStatus(ProjectStatus status);

    void save(Project project);
}
