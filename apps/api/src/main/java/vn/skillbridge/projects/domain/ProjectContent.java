package vn.skillbridge.projects.domain;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/** The SME-authored scope of a project. Only the title is mandatory while the project is a draft. */
public record ProjectContent(
        String title,
        String summary,
        String problem,
        String industry,
        String smeSize,
        ProjectComplexity complexity,
        Long budget,
        LocalDate deadline,
        List<String> skillCodes,
        List<String> acceptanceCriteria,
        List<ProjectMilestone> milestones) {

    public ProjectContent {
        if (isBlank(title)) {
            throw new IllegalArgumentException("A project title is required");
        }
        skillCodes = List.copyOf(skillCodes);
        acceptanceCriteria = List.copyOf(acceptanceCriteria);
        milestones = List.copyOf(milestones);
    }

    /** Reasons this scope cannot enter review yet, in a stable order so the SME can fix them one by one. */
    public List<ReadinessIssue> readinessIssues(LocalDate today) {
        Set<ReadinessIssue> issues = EnumSet.noneOf(ReadinessIssue.class);
        if (isBlank(summary)) issues.add(ReadinessIssue.SUMMARY_REQUIRED);
        if (isBlank(problem)) issues.add(ReadinessIssue.PROBLEM_REQUIRED);
        if (isBlank(industry)) issues.add(ReadinessIssue.INDUSTRY_REQUIRED);
        if (isBlank(smeSize)) issues.add(ReadinessIssue.SME_SIZE_REQUIRED);
        if (complexity == null) issues.add(ReadinessIssue.COMPLEXITY_REQUIRED);
        if (budget == null) issues.add(ReadinessIssue.BUDGET_REQUIRED);
        if (deadline == null) {
            issues.add(ReadinessIssue.DEADLINE_REQUIRED);
        } else if (!deadline.isAfter(today)) {
            issues.add(ReadinessIssue.DEADLINE_NOT_IN_FUTURE);
        }
        if (skillCodes.isEmpty()) issues.add(ReadinessIssue.SKILLS_REQUIRED);
        if (acceptanceCriteria.isEmpty()) issues.add(ReadinessIssue.ACCEPTANCE_CRITERIA_REQUIRED);
        if (milestones.isEmpty()) {
            issues.add(ReadinessIssue.MILESTONES_REQUIRED);
        } else {
            addMilestoneIssues(issues, today);
        }
        return new ArrayList<>(issues);
    }

    private void addMilestoneIssues(Set<ReadinessIssue> issues, LocalDate today) {
        long allocated = 0;
        for (ProjectMilestone milestone : milestones) {
            if (isBlank(milestone.title())) issues.add(ReadinessIssue.MILESTONE_TITLE_REQUIRED);
            if (milestone.budget() <= 0) issues.add(ReadinessIssue.MILESTONE_BUDGET_REQUIRED);
            if (milestone.deadline() == null) {
                issues.add(ReadinessIssue.MILESTONE_DEADLINE_REQUIRED);
            } else {
                if (!milestone.deadline().isAfter(today)) issues.add(ReadinessIssue.MILESTONE_DEADLINE_NOT_IN_FUTURE);
                if (deadline != null && milestone.deadline().isAfter(deadline)) {
                    issues.add(ReadinessIssue.MILESTONE_DEADLINE_AFTER_PROJECT);
                }
            }
            allocated += milestone.budget();
        }
        // FR-MIL-02: milestone allocations must add up to exactly the project budget.
        if (budget != null && allocated != budget) issues.add(ReadinessIssue.MILESTONE_BUDGET_MISMATCH);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
