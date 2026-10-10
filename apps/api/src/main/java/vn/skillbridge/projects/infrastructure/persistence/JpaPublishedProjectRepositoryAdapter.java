package vn.skillbridge.projects.infrastructure.persistence;

import java.util.Optional;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;
import vn.skillbridge.projects.application.ProjectPage;
import vn.skillbridge.projects.application.ProjectSearch;
import vn.skillbridge.projects.application.PublishedProjectRepository;
import vn.skillbridge.projects.domain.ProjectComplexity;
import vn.skillbridge.projects.domain.PublishedProject;

@Repository
class JpaPublishedProjectRepositoryAdapter implements PublishedProjectRepository {
    private static final String PUBLISHED = "PUBLISHED";
    private final SpringDataProjectRepository repository;

    JpaPublishedProjectRepositoryAdapter(SpringDataProjectRepository repository) {
        this.repository = repository;
    }

    @Override
    public ProjectPage<PublishedProject> findPublished(ProjectSearch search) {
        var result = repository.searchPublished(
                search.query() == null ? "" : search.query(),
                String.join(",", search.skillCodes()),
                search.skillCodes().size(),
                search.minBudget(), search.maxBudget(),
                PageRequest.of(search.page() - 1, search.pageSize()));
        return new ProjectPage<>(result.getContent().stream().map(this::toDomain).toList(),
                search.page(), search.pageSize(), result.getTotalElements());
    }

    @Override
    public Optional<PublishedProject> findPublishedById(String projectId) {
        return repository.findByPublicIdAndStatus(projectId, PUBLISHED).map(this::toDomain);
    }

    // Published rows are complete: the schema rejects missing scope fields outside DRAFT.
    private PublishedProject toDomain(ProjectJpaEntity entity) {
        return new PublishedProject(
                entity.publicId(), entity.title(), entity.smeName(), entity.smeIndustry(), entity.smeSize(),
                entity.smeContact(), ProjectComplexity.valueOf(entity.complexity()), entity.budget(),
                entity.deadline(), entity.summary(), entity.problem(), entity.skillCodes(),
                entity.acceptanceCriteria(),
                entity.milestones().stream().map(ProjectPersistenceMapper::toMilestone).toList());
    }
}
