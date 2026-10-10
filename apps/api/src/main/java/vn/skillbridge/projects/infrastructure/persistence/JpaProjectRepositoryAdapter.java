package vn.skillbridge.projects.infrastructure.persistence;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import vn.skillbridge.projects.application.ProjectRepository;
import vn.skillbridge.projects.domain.Project;
import vn.skillbridge.projects.domain.ProjectStatus;

@Repository
class JpaProjectRepositoryAdapter implements ProjectRepository {
    private final SpringDataProjectRepository repository;

    JpaProjectRepositoryAdapter(SpringDataProjectRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<Project> findById(String projectId) {
        return repository.findByPublicId(projectId).map(ProjectPersistenceMapper::toProject);
    }

    @Override
    public Optional<Project> findByIdForUpdate(String projectId) {
        return repository.findForUpdateByPublicId(projectId).map(ProjectPersistenceMapper::toProject);
    }

    @Override
    public Optional<Project> findByIdForShare(String projectId) {
        return repository.findForShareByPublicId(projectId).map(ProjectPersistenceMapper::toProject);
    }

    @Override
    public List<Project> findByIds(Collection<String> projectIds) {
        if (projectIds.isEmpty()) return List.of();
        return repository.findAllByPublicIdIn(projectIds).stream().map(ProjectPersistenceMapper::toProject).toList();
    }

    @Override
    public List<Project> findByOwner(UUID ownerId) {
        return repository.findByOwnerIdOrderByUpdatedAtDesc(ownerId).stream()
                .map(ProjectPersistenceMapper::toProject).toList();
    }

    @Override
    public List<Project> findByStatus(ProjectStatus status) {
        return repository.findByStatusOrderBySubmittedAtAsc(status.name()).stream()
                .map(ProjectPersistenceMapper::toProject).toList();
    }

    @Override
    public void save(Project project) {
        Optional<ProjectJpaEntity> existing = repository.findByPublicId(project.id());
        ProjectJpaEntity entity = existing.orElseGet(() -> new ProjectJpaEntity(UUID.randomUUID(), project.id(),
                project.ownerId(), project.createdAt()));
        ProjectPersistenceMapper.applyScalars(project, entity);
        if (existing.isEmpty()) {
            entity.skillCodes().addAll(project.content().skillCodes());
            entity.acceptanceCriteria().addAll(project.content().acceptanceCriteria());
            entity.milestones().addAll(ProjectPersistenceMapper.toMilestoneEntities(project, entity));
            repository.save(entity);
            return;
        }
        replaceCollections(project, entity);
    }

    /**
     * Rows are unique per (project, position) and (project, skill). Hibernate inserts before it deletes during
     * one flush, so stale rows are flushed away first whenever the ordered content actually changed.
     */
    private void replaceCollections(Project project, ProjectJpaEntity entity) {
        var content = project.content();
        boolean skillsChanged = !entity.skillCodes().equals(content.skillCodes());
        boolean criteriaChanged = !entity.acceptanceCriteria().equals(content.acceptanceCriteria());
        boolean milestonesChanged = !entity.milestones().stream().map(ProjectPersistenceMapper::toMilestone).toList()
                .equals(content.milestones());
        if (!skillsChanged && !criteriaChanged && !milestonesChanged) return;

        if (skillsChanged) entity.skillCodes().clear();
        if (criteriaChanged) entity.acceptanceCriteria().clear();
        if (milestonesChanged) entity.milestones().clear();
        repository.flush();

        if (skillsChanged) entity.skillCodes().addAll(content.skillCodes());
        if (criteriaChanged) entity.acceptanceCriteria().addAll(content.acceptanceCriteria());
        if (milestonesChanged) entity.milestones().addAll(ProjectPersistenceMapper.toMilestoneEntities(project, entity));
    }
}
