package vn.skillbridge.projects.application.staffing;

import java.util.Collection;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.projects.application.ProjectCalendar;
import vn.skillbridge.projects.application.ProjectException;
import vn.skillbridge.projects.application.ProjectRepository;
import vn.skillbridge.projects.domain.Project;
import vn.skillbridge.projects.domain.ProjectStatus;

/**
 * Public facade for staffing a project: applying to it, reviewing its applicants and starting work once one is
 * accepted. Drafts and projects under review are never visible through it.
 */
@Service
public class ProjectStaffingService {
    private static final Set<ProjectStatus> PUBLIC_STATUSES = EnumSet.of(ProjectStatus.PUBLISHED,
            ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED);

    private final ProjectRepository projects;
    private final ProjectCalendar calendar;

    public ProjectStaffingService(ProjectRepository projects, ProjectCalendar calendar) {
        this.projects = projects;
        this.calendar = calendar;
    }

    /**
     * The project an application targets, read under a shared lock held until the caller's transaction ends so an
     * acceptance cannot start the project in between. Callers check {@link StaffingProject#isPublished()}.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public StaffingProject lockForApplication(String projectId) {
        return projects.findByIdForShare(projectId).filter(project -> PUBLIC_STATUSES.contains(project.status()))
                .map(ProjectStaffingService::view).orElseThrow(ProjectStaffingService::notFound);
    }

    /** A project the SME owns, in any public state. Another SME's project is indistinguishable from a missing one. */
    @Transactional(readOnly = true)
    public StaffingProject ownedBy(UUID smeId, String projectId) {
        return projects.findById(projectId).filter(project -> project.isOwnedBy(smeId))
                .filter(project -> PUBLIC_STATUSES.contains(project.status()))
                .map(ProjectStaffingService::view).orElseThrow(ProjectStaffingService::notFound);
    }

    /**
     * Locks the project, checks ownership and starts work for the accepted contributor. Must join the caller's
     * transaction so the acceptance, the rejections and the project transition commit together (BR-13).
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public StaffingProject startWork(UUID smeId, String projectId, UUID contributorId) {
        Project project = projects.findByIdForUpdate(projectId).filter(candidate -> candidate.isOwnedBy(smeId))
                .orElseThrow(ProjectStaffingService::notFound);
        Project started = project.startWork(contributorId, calendar.now());
        projects.save(started);
        return view(started);
    }

    @Transactional(readOnly = true)
    public Map<String, StaffingProject> find(Collection<String> projectIds) {
        return projects.findByIds(projectIds).stream().map(ProjectStaffingService::view)
                .collect(Collectors.toMap(StaffingProject::id, Function.identity()));
    }

    private static StaffingProject view(Project project) {
        var content = project.content();
        return new StaffingProject(project.id(), project.ownerId(), content.title(), project.smeName(),
                project.smeContact(), project.status().name(),
                content.complexity() == null ? null : content.complexity().name(), content.budget(),
                content.deadline(), content.skillCodes(),
                project.assignment() == null ? null : project.assignment().contributorId());
    }

    private static ProjectException notFound() {
        return new ProjectException(ProjectException.NOT_FOUND, "Project was not found");
    }
}
