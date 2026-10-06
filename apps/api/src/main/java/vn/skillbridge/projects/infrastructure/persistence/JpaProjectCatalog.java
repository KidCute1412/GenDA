package vn.skillbridge.projects.infrastructure.persistence;

import java.util.Optional;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;
import vn.skillbridge.projects.application.ProjectCatalog;
import vn.skillbridge.projects.application.ProjectPage;
import vn.skillbridge.projects.application.ProjectSearch;
import vn.skillbridge.projects.domain.ProjectMilestone;
import vn.skillbridge.projects.domain.PublishedProject;

@Repository
class JpaProjectCatalog implements ProjectCatalog {
    private static final String PUBLISHED = "PUBLISHED";
    private final ProjectJpaRepository repository;

    JpaProjectCatalog(ProjectJpaRepository repository) {
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

    private PublishedProject toDomain(ProjectJpaEntity entity) {
        return new PublishedProject(
                entity.publicId(), entity.title(), entity.smeName(), entity.smeIndustry(), entity.smeSize(),
                entity.smeContact(), entity.budget(), entity.deadline(), entity.summary(), entity.problem(),
                entity.skillCodes(), entity.acceptanceCriteria(),
                entity.milestones().stream().map(this::toDomain).toList());
    }

    private ProjectMilestone toDomain(ProjectMilestoneJpaEntity entity) {
        return new ProjectMilestone(
                entity.publicId(), entity.position(), entity.title(), entity.budget(), entity.deadline(),
                entity.criteria());
    }
}
