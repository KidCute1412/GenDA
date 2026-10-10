package vn.skillbridge.projects.application;

import java.time.LocalDate;
import java.util.List;
import vn.skillbridge.users.application.SkillSummary;

public record ProjectView(
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
        List<SkillSummary> skills,
        List<String> acceptanceCriteria,
        List<MilestoneView> milestones) {

    public ProjectView {
        skills = List.copyOf(skills);
        acceptanceCriteria = List.copyOf(acceptanceCriteria);
        milestones = List.copyOf(milestones);
    }

    public record MilestoneView(
            String id,
            int order,
            String title,
            long budget,
            LocalDate deadline,
            List<String> criteria) {
        public MilestoneView {
            criteria = List.copyOf(criteria);
        }
    }
}
