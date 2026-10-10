package vn.skillbridge.projects.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * A project owned by one SME. The SME edits it only as a {@code DRAFT}; entering review and publication both
 * re-check readiness and the level budget range, so a policy change or a stale client cannot slip past either gate.
 */
public record Project(
        String id,
        UUID ownerId,
        String smeName,
        String smeContact,
        ProjectStatus status,
        ProjectContent content,
        Instant createdAt,
        Instant updatedAt,
        Instant submittedAt,
        Instant publishedAt,
        ProjectAssignment assignment) {

    public static Project draft(String id, UUID ownerId, String smeName, String smeContact, ProjectContent content,
            ProjectBudgetPolicy policy, Instant now) {
        requireDraftable(content, policy);
        return new Project(id, ownerId, smeName, smeContact, ProjectStatus.DRAFT, content, now, now, null, null, null);
    }

    public boolean isOwnedBy(UUID userId) {
        return ownerId != null && ownerId.equals(userId);
    }

    public Project revise(ProjectContent next, ProjectBudgetPolicy policy, Instant now) {
        requireStatus(ProjectStatus.DRAFT, "Only a draft project can be edited");
        requireDraftable(next, policy);
        return new Project(id, ownerId, smeName, smeContact, status, next, createdAt, now, submittedAt, publishedAt,
                assignment);
    }

    public Project submit(ProjectBudgetPolicy policy, LocalDate today, Instant now) {
        requireStatus(ProjectStatus.DRAFT, "Only a draft project can be submitted for review");
        requireReady(policy, today);
        return new Project(id, ownerId, smeName, smeContact, ProjectStatus.PENDING_REVIEW, content, createdAt, now,
                now, publishedAt, assignment);
    }

    public Project publish(ProjectBudgetPolicy policy, LocalDate today, Instant now) {
        requireStatus(ProjectStatus.PENDING_REVIEW, "Only a project pending review can be published");
        requireReady(policy, today);
        return new Project(id, ownerId, smeName, smeContact, ProjectStatus.PUBLISHED, content, createdAt, now,
                submittedAt, now, assignment);
    }

    /** The admin returns the project unchanged; only the SME may rewrite scope, level or budget. */
    public Project returnToDraft(Instant now) {
        requireStatus(ProjectStatus.PENDING_REVIEW, "Only a project pending review can be returned");
        return new Project(id, ownerId, smeName, smeContact, ProjectStatus.DRAFT, content, createdAt, now, null,
                publishedAt, assignment);
    }

    /** The owning SME accepted an applicant: the project leaves the catalog and work starts (FR-APP-05). */
    public Project startWork(UUID contributorId, Instant now) {
        requireStatus(ProjectStatus.PUBLISHED, "Only a published project can start work");
        return new Project(id, ownerId, smeName, smeContact, ProjectStatus.IN_PROGRESS, content, createdAt, now,
                submittedAt, publishedAt, new ProjectAssignment(contributorId, now));
    }

    public boolean isOpenForApplications() {
        return status == ProjectStatus.PUBLISHED;
    }

    /** Everything that would block submission today, including a budget outside the declared level's range. */
    public List<ReadinessIssue> submissionIssues(ProjectBudgetPolicy policy, LocalDate today) {
        List<ReadinessIssue> issues = content.readinessIssues(today);
        if (content.complexity() != null && content.budget() != null
                && !policy.rangeFor(content.complexity()).contains(content.budget())) {
            issues.add(ReadinessIssue.BUDGET_OUTSIDE_LEVEL_RANGE);
        }
        return List.copyOf(issues);
    }

    private void requireReady(ProjectBudgetPolicy policy, LocalDate today) {
        List<ReadinessIssue> issues = content.readinessIssues(today);
        if (!issues.isEmpty()) {
            throw new ProjectRuleViolation(ProjectRuleViolation.NOT_READY, "Project is missing required information",
                    Map.of("issues", issues.stream().map(Enum::name).toList()));
        }
        policy.requireWithinLevel(content.complexity(), content.budget());
    }

    private void requireStatus(ProjectStatus expected, String message) {
        if (status != expected) {
            throw new ProjectRuleViolation(ProjectRuleViolation.INVALID_TRANSITION, message,
                    Map.of("status", status.name()));
        }
    }

    private static void requireDraftable(ProjectContent content, ProjectBudgetPolicy policy) {
        if (content.budget() != null) policy.requireWithinOverall(content.budget());
    }
}
