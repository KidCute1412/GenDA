package vn.skillbridge.projects.application.moderation;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.projects.application.ManagedProjectView;
import vn.skillbridge.projects.application.ManagedProjectViews;
import vn.skillbridge.projects.application.ModerationEventRepository;
import vn.skillbridge.projects.application.ProjectCalendar;
import vn.skillbridge.projects.application.ProjectException;
import vn.skillbridge.projects.application.ProjectRepository;
import vn.skillbridge.projects.domain.ModerationEvent;
import vn.skillbridge.projects.domain.Project;
import vn.skillbridge.projects.domain.ProjectBudgetPolicy;
import vn.skillbridge.projects.domain.ProjectComplexity;
import vn.skillbridge.projects.domain.ProjectStatus;

/**
 * Admin review of submitted projects (FR-PRJ-04, FR-PRJ-11). The admin publishes a consistent project or returns
 * it to its SME with a reason; the admin never edits the SME's scope, level or budget.
 */
@Service
public class ProjectModerationService {
    private final ProjectRepository projects;
    private final ModerationEventRepository events;
    private final ManagedProjectViews views;
    private final AccountProfileService accounts;
    private final ProjectBudgetPolicy budgetPolicy;
    private final ProjectCalendar calendar;

    public ProjectModerationService(ProjectRepository projects, ModerationEventRepository events,
            ManagedProjectViews views, AccountProfileService accounts, ProjectBudgetPolicy budgetPolicy,
            ProjectCalendar calendar) {
        this.projects = projects;
        this.events = events;
        this.views = views;
        this.accounts = accounts;
        this.budgetPolicy = budgetPolicy;
        this.calendar = calendar;
    }

    @Transactional(readOnly = true)
    public List<ManagedProjectView> pendingQueue(UUID adminId) {
        requireAdmin(adminId);
        return views.toViews(projects.findByStatus(ProjectStatus.PENDING_REVIEW));
    }

    @Transactional
    public ManagedProjectView publish(UUID adminId, String projectId) {
        requireAdmin(adminId);
        Project published = requireProject(projectId).publish(budgetPolicy, calendar.today(), calendar.now());
        projects.save(published);
        events.append(ModerationEvent.published(published.id(), adminId, published.publishedAt()));
        return views.toView(published);
    }

    @Transactional
    public ManagedProjectView returnToDraft(UUID adminId, String projectId, String reason,
            ProjectComplexity suggestedComplexity) {
        requireAdmin(adminId);
        Project current = requireProject(projectId);
        // Validate the reason before the transition so a rejected command leaves no trace.
        ModerationEvent event = ModerationEvent.returned(projectId, adminId, reason, suggestedComplexity,
                calendar.now());
        Project returned = current.returnToDraft(event.occurredAt());
        projects.save(returned);
        events.append(event);
        return views.toView(returned);
    }

    private Project requireProject(String projectId) {
        return projects.findByIdForUpdate(projectId)
                .orElseThrow(() -> new ProjectException(ProjectException.NOT_FOUND, "Project not found: " + projectId));
    }

    private void requireAdmin(UUID userId) {
        if (!accounts.isActiveAdmin(userId)) {
            throw new ProjectException(ProjectException.ADMIN_ROLE_REQUIRED, "An admin account is required");
        }
    }
}
