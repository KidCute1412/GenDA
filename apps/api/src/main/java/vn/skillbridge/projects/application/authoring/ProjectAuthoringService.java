package vn.skillbridge.projects.application.authoring;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.IntStream;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.auth.application.account.AccountProfile;
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
import vn.skillbridge.projects.domain.ProjectContent;
import vn.skillbridge.projects.domain.ProjectMilestone;
import vn.skillbridge.users.application.SkillQueryService;

/** SME side of the project lifecycle: create and edit drafts, then submit them to the admin review queue. */
@Service
public class ProjectAuthoringService {
    private final ProjectRepository projects;
    private final ModerationEventRepository events;
    private final ManagedProjectViews views;
    private final SkillQueryService skills;
    private final AccountProfileService accounts;
    private final ProjectBudgetPolicy budgetPolicy;
    private final ProjectCalendar calendar;

    public ProjectAuthoringService(ProjectRepository projects, ModerationEventRepository events,
            ManagedProjectViews views, SkillQueryService skills, AccountProfileService accounts,
            ProjectBudgetPolicy budgetPolicy, ProjectCalendar calendar) {
        this.projects = projects;
        this.events = events;
        this.views = views;
        this.skills = skills;
        this.accounts = accounts;
        this.budgetPolicy = budgetPolicy;
        this.calendar = calendar;
    }

    @Transactional(readOnly = true)
    public List<ManagedProjectView> listOwn(UUID smeId) {
        requireApprovedSme(smeId);
        return views.toViews(projects.findByOwner(smeId));
    }

    @Transactional(readOnly = true)
    public ManagedProjectView getOwn(UUID smeId, String projectId) {
        requireApprovedSme(smeId);
        return views.toView(requireOwned(smeId, projects.findById(projectId).orElse(null), projectId));
    }

    @Transactional
    public ManagedProjectView create(UUID smeId, ProjectDraftCommand command) {
        AccountProfile sme = requireApprovedSme(smeId);
        Project project = Project.draft(newProjectId(), smeId, sme.displayName(), sme.email(), toContent(command),
                budgetPolicy, calendar.now());
        projects.save(project);
        return views.toView(project);
    }

    @Transactional
    public ManagedProjectView update(UUID smeId, String projectId, ProjectDraftCommand command) {
        requireApprovedSme(smeId);
        Project current = requireOwned(smeId, projects.findByIdForUpdate(projectId).orElse(null), projectId);
        Project revised = current.revise(toContent(command), budgetPolicy, calendar.now());
        projects.save(revised);
        return views.toView(revised);
    }

    @Transactional
    public ManagedProjectView submit(UUID smeId, String projectId) {
        requireApprovedSme(smeId);
        Project current = requireOwned(smeId, projects.findByIdForUpdate(projectId).orElse(null), projectId);
        Project submitted = current.submit(budgetPolicy, calendar.today(), calendar.now());
        projects.save(submitted);
        events.append(ModerationEvent.submitted(submitted.id(), smeId, submitted.submittedAt()));
        return views.toView(submitted);
    }

    private AccountProfile requireApprovedSme(UUID userId) {
        if (!accounts.isApprovedSme(userId)) {
            throw new ProjectException(ProjectException.SME_NOT_APPROVED,
                    "Only an active, approved SME account can manage projects");
        }
        return accounts.get(userId);
    }

    /** Another SME's project is reported as missing so its existence is not disclosed. */
    private static Project requireOwned(UUID smeId, Project project, String projectId) {
        if (project == null || !project.isOwnedBy(smeId)) {
            throw new ProjectException(ProjectException.NOT_FOUND, "Project not found: " + projectId);
        }
        return project;
    }

    private ProjectContent toContent(ProjectDraftCommand command) {
        List<ProjectMilestone> milestones = IntStream.range(0, command.milestones().size())
                .mapToObj(index -> {
                    var milestone = command.milestones().get(index);
                    int order = index + 1;
                    return new ProjectMilestone("m" + order, order, trimToNull(milestone.title()),
                            milestone.budget(), milestone.deadline(), cleanLines(milestone.criteria()));
                })
                .toList();
        return new ProjectContent(command.title().trim(), trimToNull(command.summary()),
                trimToNull(command.problem()), trimToNull(command.industry()), trimToNull(command.smeSize()),
                command.complexity(), command.budget(), command.deadline(), canonicalSkillCodes(command.skillCodes()),
                cleanLines(command.acceptanceCriteria()), milestones);
    }

    private List<String> canonicalSkillCodes(List<String> requested) {
        List<String> normalized = requested.stream().map(code -> code.trim().toLowerCase(Locale.ROOT)).toList();
        if (new LinkedHashSet<>(normalized).size() != normalized.size()) {
            throw new ProjectException(ProjectException.DUPLICATE_SKILL, "A skill can only be selected once");
        }
        if (skills.findByCodes(normalized).size() != normalized.size()) {
            throw new ProjectException(ProjectException.UNKNOWN_SKILL,
                    "One or more skills are not in the canonical catalog");
        }
        return normalized;
    }

    private static List<String> cleanLines(List<String> values) {
        return values.stream().map(String::trim).filter(value -> !value.isEmpty()).toList();
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String newProjectId() {
        return "p-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}
