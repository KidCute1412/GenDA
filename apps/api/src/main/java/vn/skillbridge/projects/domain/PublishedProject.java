package vn.skillbridge.projects.domain;

import java.time.LocalDate;
import java.util.List;

public record PublishedProject(
        String id,
        String title,
        String smeName,
        String smeIndustry,
        String smeSize,
        String smeContact,
        long budget,
        LocalDate deadline,
        String summary,
        String problem,
        List<String> skillCodes,
        List<String> acceptanceCriteria,
        List<ProjectMilestone> milestones) {

    public PublishedProject {
        skillCodes = List.copyOf(skillCodes);
        acceptanceCriteria = List.copyOf(acceptanceCriteria);
        milestones = List.copyOf(milestones);
    }
}
