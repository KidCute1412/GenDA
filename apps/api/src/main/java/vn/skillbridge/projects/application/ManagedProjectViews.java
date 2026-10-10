package vn.skillbridge.projects.application;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.stereotype.Component;
import vn.skillbridge.projects.domain.ModerationAction;
import vn.skillbridge.projects.domain.ModerationEvent;
import vn.skillbridge.projects.domain.Project;
import vn.skillbridge.projects.domain.ProjectBudgetPolicy;
import vn.skillbridge.projects.domain.ProjectContent;
import vn.skillbridge.projects.domain.ProjectMilestone;
import vn.skillbridge.users.application.SkillSummary;
import vn.skillbridge.users.application.SkillQueryService;

/** Builds owner/admin views in batches: one skill lookup and one moderation lookup per list. */
@Component
public class ManagedProjectViews {
    private final SkillQueryService skills;
    private final ModerationEventRepository events;
    private final ProjectBudgetPolicy budgetPolicy;
    private final ProjectCalendar calendar;

    public ManagedProjectViews(SkillQueryService skills, ModerationEventRepository events,
            ProjectBudgetPolicy budgetPolicy, ProjectCalendar calendar) {
        this.skills = skills;
        this.events = events;
        this.budgetPolicy = budgetPolicy;
        this.calendar = calendar;
    }

    public ManagedProjectView toView(Project project) {
        return toViews(List.of(project)).getFirst();
    }

    public List<ManagedProjectView> toViews(List<Project> projects) {
        if (projects.isEmpty()) return List.of();
        LinkedHashSet<String> codes = new LinkedHashSet<>();
        projects.forEach(project -> codes.addAll(project.content().skillCodes()));
        Map<String, SkillSummary> skillIndex = skills.findByCodes(codes);
        Map<String, ModerationEvent> latest = events.findLatestByProjectIds(
                projects.stream().map(Project::id).toList());
        LocalDate today = calendar.today();
        return projects.stream().map(project -> toView(project, skillIndex, latest.get(project.id()), today)).toList();
    }

    private ManagedProjectView toView(Project project, Map<String, SkillSummary> skillIndex,
            ModerationEvent latestEvent, LocalDate today) {
        ProjectContent content = project.content();
        ManagedProjectView.ReturnNote latestReturn = latestEvent != null
                && latestEvent.action() == ModerationAction.RETURNED
                ? new ManagedProjectView.ReturnNote(latestEvent.reason(), latestEvent.suggestedComplexity(),
                        latestEvent.occurredAt())
                : null;
        return new ManagedProjectView(
                project.id(), project.status(), content.title(), content.summary(), content.problem(),
                content.industry(), content.smeSize(), project.smeName(), project.smeContact(),
                content.complexity(), content.budget(), content.deadline(),
                content.skillCodes().stream().map(skillIndex::get).filter(Objects::nonNull).toList(),
                content.acceptanceCriteria(),
                content.milestones().stream().map(ManagedProjectViews::toMilestoneView).toList(),
                project.submissionIssues(budgetPolicy, today),
                project.createdAt(), project.updatedAt(), project.submittedAt(), project.publishedAt(),
                latestReturn);
    }

    private static ManagedProjectView.MilestonePlanView toMilestoneView(ProjectMilestone milestone) {
        return new ManagedProjectView.MilestonePlanView(milestone.id(), milestone.order(), milestone.title(),
                milestone.budget(), milestone.deadline(), milestone.criteria());
    }
}
