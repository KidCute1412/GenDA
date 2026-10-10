package vn.skillbridge.projects.application;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.projects.domain.ProjectMilestone;
import vn.skillbridge.projects.domain.PublishedProject;
import vn.skillbridge.users.application.SkillQueryService;
import vn.skillbridge.users.application.SkillSummary;

@Service
@Transactional(readOnly = true)
public class ProjectQueryService {
    private final ProjectCatalog projects;
    private final SkillQueryService skills;

    public ProjectQueryService(ProjectCatalog projects, SkillQueryService skills) {
        this.projects = projects;
        this.skills = skills;
    }

    public ProjectPage<ProjectView> browse(ProjectSearch search) {
        ProjectPage<PublishedProject> page = projects.findPublished(search);
        LinkedHashSet<String> codes = page.data().stream()
                .flatMap(project -> project.skillCodes().stream())
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
        Map<String, SkillSummary> skillIndex = skills.findByCodes(codes);
        return new ProjectPage<>(
                page.data().stream().map(project -> toView(project, skillIndex)).toList(),
                page.page(), page.pageSize(), page.total());
    }

    public ProjectView getPublished(String projectId) {
        PublishedProject project = projects.findPublishedById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));
        return toView(project, skills.findByCodes(project.skillCodes()));
    }

    private ProjectView toView(PublishedProject project, Map<String, SkillSummary> skillIndex) {
        List<SkillSummary> resolvedSkills = project.skillCodes().stream()
                .map(skillIndex::get)
                .filter(java.util.Objects::nonNull)
                .toList();
        return new ProjectView(
                project.id(), project.title(), project.smeName(), project.smeIndustry(), project.smeSize(),
                project.smeContact(), project.budget(), project.deadline(), project.summary(), project.problem(),
                resolvedSkills, project.acceptanceCriteria(),
                project.milestones().stream().map(this::toMilestoneView).toList());
    }

    private ProjectView.MilestoneView toMilestoneView(ProjectMilestone milestone) {
        return new ProjectView.MilestoneView(
                milestone.id(), milestone.order(), milestone.title(), milestone.budget(), milestone.deadline(),
                milestone.criteria());
    }
}
