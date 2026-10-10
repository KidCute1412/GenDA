package vn.skillbridge.projects.application.execution;

import java.time.Clock;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import vn.skillbridge.projects.application.ProjectRepository;
import vn.skillbridge.projects.application.ProjectException;
import vn.skillbridge.projects.domain.Project;

@Service
public class ProjectExecutionService {
    private final ProjectRepository projects;
    private final Clock clock;
    public ProjectExecutionService(ProjectRepository projects, Clock clock) { this.projects = projects; this.clock = clock; }

    @Transactional(readOnly = true)
    public ExecutionProject find(String id) { return view(projects.findById(id).orElseThrow(ProjectExecutionService::missing)); }

    @Transactional(propagation = Propagation.MANDATORY)
    public ExecutionProject lock(String id) { return view(projects.findByIdForUpdate(id).orElseThrow(ProjectExecutionService::missing)); }

    @Transactional(propagation = Propagation.MANDATORY)
    public void complete(String id) {
        Project project = projects.findByIdForUpdate(id).orElseThrow(ProjectExecutionService::missing);
        projects.save(project.complete(clock.instant()));
    }

    private static ExecutionProject view(Project p) {
        return new ExecutionProject(p.id(), p.ownerId(), p.assignment() == null ? null : p.assignment().contributorId(),
                p.content().title(), p.smeName(), p.status().name(), p.content().milestones().stream().map(m ->
                new ExecutionProject.Plan(m.id(), m.order(), m.title(), m.budget(), m.deadline(), m.criteria())).toList());
    }
    private static ProjectException missing() { return new ProjectException(ProjectException.NOT_FOUND, "Project was not found"); }
}
