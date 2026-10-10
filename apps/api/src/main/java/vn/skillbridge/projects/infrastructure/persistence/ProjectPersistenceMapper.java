package vn.skillbridge.projects.infrastructure.persistence;

import java.util.List;
import java.util.UUID;
import vn.skillbridge.projects.domain.Project;
import vn.skillbridge.projects.domain.ProjectAssignment;
import vn.skillbridge.projects.domain.ProjectComplexity;
import vn.skillbridge.projects.domain.ProjectContent;
import vn.skillbridge.projects.domain.ProjectMilestone;
import vn.skillbridge.projects.domain.ProjectStatus;

final class ProjectPersistenceMapper {
    private ProjectPersistenceMapper() {}

    static Project toProject(ProjectJpaEntity entity) {
        var content = new ProjectContent(entity.title(), entity.summary(), entity.problem(), entity.smeIndustry(),
                entity.smeSize(), entity.complexity() == null ? null : ProjectComplexity.valueOf(entity.complexity()),
                entity.budget(), entity.deadline(), entity.skillCodes(), entity.acceptanceCriteria(),
                entity.milestones().stream().map(ProjectPersistenceMapper::toMilestone).toList());
        return new Project(entity.publicId(), entity.ownerId(), entity.smeName(), entity.smeContact(),
                ProjectStatus.valueOf(entity.status()), content, entity.createdAt(), entity.updatedAt(),
                entity.submittedAt(), entity.publishedAt(), entity.assignedContributorId() == null ? null
                        : new ProjectAssignment(entity.assignedContributorId(), entity.startedAt()));
    }

    static ProjectMilestone toMilestone(ProjectMilestoneJpaEntity entity) {
        return new ProjectMilestone(entity.publicId(), entity.position(), entity.title(), entity.budget(),
                entity.deadline(), entity.criteria());
    }

    static void applyScalars(Project project, ProjectJpaEntity entity) {
        ProjectContent content = project.content();
        entity.applyScalars(content.title(), project.smeName(), content.industry(), content.smeSize(),
                project.smeContact(), content.complexity() == null ? null : content.complexity().name(),
                content.budget(), content.deadline(), project.status().name(), content.summary(), content.problem(),
                project.updatedAt(), project.submittedAt(), project.publishedAt());
        entity.assign(project.assignment() == null ? null : project.assignment().contributorId(),
                project.assignment() == null ? null : project.assignment().startedAt());
    }

    static List<ProjectMilestoneJpaEntity> toMilestoneEntities(Project project, ProjectJpaEntity owner) {
        return project.content().milestones().stream()
                .map(milestone -> new ProjectMilestoneJpaEntity(UUID.randomUUID(), owner, milestone.id(),
                        milestone.order(), milestone.title(), milestone.budget(), milestone.deadline(),
                        milestone.criteria()))
                .toList();
    }
}
