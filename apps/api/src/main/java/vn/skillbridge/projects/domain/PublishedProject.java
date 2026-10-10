package vn.skillbridge.projects.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PublishedProject(
        String id,
        UUID ownerId,
        String title,
        String smeName,
        String smeIndustry,
        String smeSize,
        String smeContact,
        ProjectComplexity complexity,
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
