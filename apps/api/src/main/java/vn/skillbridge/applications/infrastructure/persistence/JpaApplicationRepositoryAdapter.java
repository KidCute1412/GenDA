package vn.skillbridge.applications.infrastructure.persistence;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Repository;
import vn.skillbridge.applications.application.ApplicationRepository;
import vn.skillbridge.applications.domain.Application;
import vn.skillbridge.applications.domain.ApplicationStatus;
import vn.skillbridge.applications.domain.EligibilitySource;

@Repository
class JpaApplicationRepositoryAdapter implements ApplicationRepository {
    private static final List<String> ACTIVE = List.of("SUBMITTED", "SHORTLISTED", "ACCEPTED");
    private final SpringDataApplicationRepository repository;

    JpaApplicationRepositoryAdapter(SpringDataApplicationRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<Application> findById(UUID applicationId) {
        return repository.findById(applicationId).map(JpaApplicationRepositoryAdapter::toDomain);
    }

    @Override
    public Optional<Application> findByIdForUpdate(UUID applicationId) {
        return repository.findForUpdateById(applicationId).map(JpaApplicationRepositoryAdapter::toDomain);
    }

    @Override
    public List<Application> findByContributor(UUID contributorId) {
        return repository.findByContributorIdOrderBySubmittedAtDesc(contributorId).stream()
                .map(JpaApplicationRepositoryAdapter::toDomain).toList();
    }

    @Override
    public List<Application> findByProjectForUpdate(String projectId) {
        return repository.findForUpdateByProjectId(projectId).stream().map(JpaApplicationRepositoryAdapter::toDomain)
                .toList();
    }

    @Override
    public List<Application> findByProject(String projectId) {
        return repository.findByProjectIdOrderBySubmittedAtAsc(projectId).stream()
                .map(JpaApplicationRepositoryAdapter::toDomain).toList();
    }

    @Override
    public boolean hasActive(String projectId, UUID contributorId) {
        return repository.existsByProjectIdAndContributorIdAndStatusIn(projectId, contributorId, ACTIVE);
    }

    @Override
    public Map<String, Counts> countByProjects(Collection<String> projectIds) {
        if (projectIds.isEmpty()) return Map.of();
        return repository.countByProjectIds(projectIds).stream().collect(Collectors.toMap(
                SpringDataApplicationRepository.ProjectCounts::getProjectId,
                row -> new Counts(row.getOpen().intValue(), row.getTotal().intValue())));
    }

    @Override
    public void save(Application application) {
        ApplicationJpaEntity entity = repository.findById(application.id()).orElseGet(() -> new ApplicationJpaEntity(
                application.id(), application.projectId(), application.contributorId(), application.submittedAt()));
        entity.coverLetter = application.coverLetter();
        entity.status = application.status().name();
        entity.eligibilitySource = application.eligibilitySource().name();
        entity.updatedAt = application.updatedAt();
        entity.decidedAt = application.decidedAt();
        entity.decidedBy = application.decidedBy();
        try {
            // Flush now so the partial unique indexes reject a concurrent duplicate inside this call.
            repository.saveAndFlush(entity);
        } catch (DataIntegrityViolationException exception) {
            throw new DuplicateApplicationException(exception);
        }
    }

    private static Application toDomain(ApplicationJpaEntity entity) {
        return new Application(entity.id, entity.projectId, entity.contributorId, entity.coverLetter,
                ApplicationStatus.valueOf(entity.status), EligibilitySource.valueOf(entity.eligibilitySource),
                entity.submittedAt, entity.updatedAt, entity.decidedAt, entity.decidedBy);
    }
}
