package vn.skillbridge.projects.application;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import vn.skillbridge.projects.domain.ProjectComplexity;
import vn.skillbridge.projects.domain.ProjectStatus;
import vn.skillbridge.projects.domain.ReadinessIssue;
import vn.skillbridge.users.application.SkillSummary;

/** A project as its owning SME, or a reviewing admin, sees it in any lifecycle state. */
public record ManagedProjectView(
        String id,
        ProjectStatus status,
        String title,
        String summary,
        String problem,
        String industry,
        String smeSize,
        String smeName,
        String smeContact,
        ProjectComplexity complexity,
        Long budget,
        LocalDate deadline,
        List<SkillSummary> skills,
        List<String> acceptanceCriteria,
        List<MilestonePlanView> milestones,
        List<ReadinessIssue> submissionIssues,
        Instant createdAt,
        Instant updatedAt,
        Instant submittedAt,
        Instant publishedAt,
        ReturnNote latestReturn) {

    public ManagedProjectView {
        skills = List.copyOf(skills);
        acceptanceCriteria = List.copyOf(acceptanceCriteria);
        milestones = List.copyOf(milestones);
        submissionIssues = List.copyOf(submissionIssues);
    }

    public record MilestonePlanView(
            String id,
            int order,
            String title,
            long budget,
            LocalDate deadline,
            List<String> criteria) {
        public MilestonePlanView {
            criteria = List.copyOf(criteria);
        }
    }

    /** Why an admin last returned the project to draft; present only while that return is the latest event. */
    public record ReturnNote(String reason, ProjectComplexity suggestedComplexity, Instant returnedAt) {}
}
