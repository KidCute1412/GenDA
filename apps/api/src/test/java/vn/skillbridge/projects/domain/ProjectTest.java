package vn.skillbridge.projects.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.InstanceOfAssertFactories.list;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class ProjectTest {
    private static final UUID SME = UUID.fromString("40000000-0000-0000-0000-000000000002");
    private static final Instant NOW = Instant.parse("2026-10-09T03:00:00Z");
    private static final LocalDate TODAY = LocalDate.of(2026, 10, 9);
    private static final ProjectBudgetPolicy POLICY = ProjectBudgetPolicy.standard();

    @Test
    void aTitleOnlyDraftCanBeSavedButNotSubmitted() {
        Project draft = Project.draft("p-1", SME, "Coffee Lab", "sme@example.com",
                new ProjectContent("Landing page", null, null, null, null, null, null, null, List.of(), List.of(),
                        List.of()), POLICY, NOW);

        assertThat(draft.status()).isEqualTo(ProjectStatus.DRAFT);
        assertThatThrownBy(() -> draft.submit(POLICY, TODAY, NOW))
                .isInstanceOf(ProjectRuleViolation.class)
                .satisfies(error -> {
                    var violation = (ProjectRuleViolation) error;
                    assertThat(violation.code()).isEqualTo(ProjectRuleViolation.NOT_READY);
                    assertThat(violation.details().get("issues")).asInstanceOf(list(String.class)).contains(
                            "SUMMARY_REQUIRED", "COMPLEXITY_REQUIRED", "BUDGET_REQUIRED", "MILESTONES_REQUIRED");
                });
    }

    @Test
    void aCompleteDraftEntersReview() {
        Project submitted = draft(ProjectComplexity.MEDIUM, 2_000_000).submit(POLICY, TODAY, NOW);

        assertThat(submitted.status()).isEqualTo(ProjectStatus.PENDING_REVIEW);
        assertThat(submitted.submittedAt()).isEqualTo(NOW);
        assertThat(submitted.submissionIssues(POLICY, TODAY)).isEmpty();
    }

    @ParameterizedTest
    @CsvSource({
            "BASIC, 1000000", "BASIC, 1500000",
            "MEDIUM, 1500000", "MEDIUM, 3500000",
            "HIGH, 3500000", "HIGH, 5000000"
    })
    void acceptsBothInclusiveBoundariesOfEachLevel(ProjectComplexity complexity, long budget) {
        assertThat(draft(complexity, budget).submit(POLICY, TODAY, NOW).publish(POLICY, TODAY, NOW).status())
                .isEqualTo(ProjectStatus.PUBLISHED);
    }

    @ParameterizedTest
    @CsvSource({"BASIC, 2000000, 1000000, 1500000", "MEDIUM, 1400000, 1500000, 3500000", "HIGH, 3400000, 3500000, 5000000"})
    void rejectsABudgetOutsideTheDeclaredLevel(ProjectComplexity complexity, long budget, long min, long max) {
        Project draft = draft(complexity, budget);

        assertThat(draft.submissionIssues(POLICY, TODAY)).containsExactly(ReadinessIssue.BUDGET_OUTSIDE_LEVEL_RANGE);
        assertThatThrownBy(() -> draft.submit(POLICY, TODAY, NOW))
                .isInstanceOf(ProjectRuleViolation.class)
                .satisfies(error -> {
                    var violation = (ProjectRuleViolation) error;
                    assertThat(violation.code()).isEqualTo(ProjectRuleViolation.BUDGET_OUTSIDE_LEVEL_RANGE);
                    assertThat(violation.details()).containsEntry("complexity", complexity.name())
                            .containsEntry("minimumBudget", min)
                            .containsEntry("maximumBudget", max)
                            .containsEntry("submittedBudget", budget);
                });
    }

    @Test
    void rejectsADraftBudgetOutsideTheMvpRange() {
        assertThatThrownBy(() -> draft(ProjectComplexity.HIGH, 6_000_000))
                .isInstanceOf(ProjectRuleViolation.class)
                .extracting("code").isEqualTo(ProjectRuleViolation.BUDGET_OUT_OF_RANGE);
    }

    @ParameterizedTest
    @CsvSource({"BASIC, 999999", "BASIC, 1500001", "MEDIUM, 1499999", "MEDIUM, 3500001",
            "HIGH, 3499999", "HIGH, 5000001"})
    void rejectsAmountsJustOutsideBothBoundariesAtSubmissionAndPublication(ProjectComplexity level, long budget) {
        assertThatThrownBy(() -> POLICY.requireWithinLevel(level, budget))
                .isInstanceOf(ProjectRuleViolation.class).extracting("code")
                .isEqualTo(ProjectRuleViolation.BUDGET_OUTSIDE_LEVEL_RANGE);
        var scope = content(level, budget, List.of(
                new ProjectMilestone("m1", 1, "Delivery", budget, LocalDate.of(2026, 12, 1), List.of())));
        var draft = new Project("p-1", SME, "Coffee Lab", "sme@example.com", ProjectStatus.DRAFT,
                scope, NOW, NOW, null, null, null);
        var pending = new Project("p-1", SME, "Coffee Lab", "sme@example.com", ProjectStatus.PENDING_REVIEW,
                scope, NOW, NOW, NOW, null, null);
        assertThatThrownBy(() -> draft.submit(POLICY, TODAY, NOW)).isInstanceOf(ProjectRuleViolation.class)
                .extracting("code").isEqualTo(ProjectRuleViolation.BUDGET_OUTSIDE_LEVEL_RANGE);
        assertThatThrownBy(() -> pending.publish(POLICY, TODAY, NOW)).isInstanceOf(ProjectRuleViolation.class)
                .extracting("code").isEqualTo(ProjectRuleViolation.BUDGET_OUTSIDE_LEVEL_RANGE);
    }

    @Test
    void reportsMilestoneProblemsBeforeSubmission() {
        var milestones = List.of(
                new ProjectMilestone("m1", 1, " ", 500_000, TODAY, List.of()),
                new ProjectMilestone("m2", 2, "Final", 1_000_000, LocalDate.of(2027, 3, 1), List.of()));
        Project draft = Project.draft("p-1", SME, "Coffee Lab", "sme@example.com", content(
                ProjectComplexity.MEDIUM, 2_000_000, milestones), POLICY, NOW);

        assertThat(draft.submissionIssues(POLICY, TODAY)).containsExactly(
                ReadinessIssue.MILESTONE_TITLE_REQUIRED,
                ReadinessIssue.MILESTONE_DEADLINE_NOT_IN_FUTURE,
                ReadinessIssue.MILESTONE_DEADLINE_AFTER_PROJECT,
                ReadinessIssue.MILESTONE_BUDGET_MISMATCH);
    }

    @Test
    void onlyADraftCanBeEditedOrSubmitted() {
        Project pending = draft(ProjectComplexity.MEDIUM, 2_000_000).submit(POLICY, TODAY, NOW);

        assertThatThrownBy(() -> pending.revise(pending.content(), POLICY, NOW))
                .isInstanceOf(ProjectRuleViolation.class)
                .extracting("code").isEqualTo(ProjectRuleViolation.INVALID_TRANSITION);
        assertThatThrownBy(() -> pending.submit(POLICY, TODAY, NOW))
                .extracting("code").isEqualTo(ProjectRuleViolation.INVALID_TRANSITION);
    }

    @Test
    void publicationRevalidatesTheDeadline() {
        Project pending = draft(ProjectComplexity.MEDIUM, 2_000_000).submit(POLICY, TODAY, NOW);

        assertThatThrownBy(() -> pending.publish(POLICY, LocalDate.of(2027, 2, 1), NOW))
                .isInstanceOf(ProjectRuleViolation.class)
                .extracting("code").isEqualTo(ProjectRuleViolation.NOT_READY);
        Project published = pending.publish(POLICY, TODAY, NOW);
        assertThat(published.status()).isEqualTo(ProjectStatus.PUBLISHED);
        assertThat(published.publishedAt()).isEqualTo(NOW);
    }

    @Test
    void acceptingAnApplicantStartsAPublishedProjectOnce() {
        Project published = draft(ProjectComplexity.MEDIUM, 2_000_000).submit(POLICY, TODAY, NOW)
                .publish(POLICY, TODAY, NOW);
        UUID contributor = UUID.randomUUID();

        Project started = published.startWork(contributor, NOW.plusSeconds(60));

        assertThat(started.status()).isEqualTo(ProjectStatus.IN_PROGRESS);
        assertThat(started.assignment()).isEqualTo(new ProjectAssignment(contributor, NOW.plusSeconds(60)));
        assertThat(started.isOpenForApplications()).isFalse();
        assertThatThrownBy(() -> started.startWork(UUID.randomUUID(), NOW))
                .extracting("code").isEqualTo(ProjectRuleViolation.INVALID_TRANSITION);
        assertThatThrownBy(() -> draft(ProjectComplexity.MEDIUM, 2_000_000).startWork(contributor, NOW))
                .extracting("code").isEqualTo(ProjectRuleViolation.INVALID_TRANSITION);
    }

    @Test
    void aReturnedProjectKeepsTheSmeContentAndBecomesEditableAgain() {
        Project pending = draft(ProjectComplexity.BASIC, 1_200_000).submit(POLICY, TODAY, NOW);

        Project returned = pending.returnToDraft(NOW);

        assertThat(returned.status()).isEqualTo(ProjectStatus.DRAFT);
        assertThat(returned.content()).isEqualTo(pending.content());
        assertThat(returned.submittedAt()).isNull();
        assertThat(returned.revise(pending.content(), POLICY, NOW).status()).isEqualTo(ProjectStatus.DRAFT);
    }

    @Test
    void aReturnRequiresAMeaningfulReason() {
        assertThatThrownBy(() -> ModerationEvent.returned("p-1", SME, "  too short ", null, NOW))
                .isInstanceOf(ProjectRuleViolation.class)
                .extracting("code").isEqualTo(ProjectRuleViolation.RETURN_REASON_REQUIRED);
        assertThat(ModerationEvent.returned("p-1", SME, "  Scope needs a HIGH level  ", ProjectComplexity.HIGH, NOW)
                .reason()).isEqualTo("Scope needs a HIGH level");
    }

    private static Project draft(ProjectComplexity complexity, long budget) {
        long first = budget / 2;
        var milestones = List.of(
                new ProjectMilestone("m1", 1, "Draft", first, LocalDate.of(2026, 11, 1), List.of("Reviewed")),
                new ProjectMilestone("m2", 2, "Final", budget - first, LocalDate.of(2026, 12, 1), List.of()));
        return Project.draft("p-1", SME, "Coffee Lab", "sme@example.com", content(complexity, budget, milestones),
                POLICY, NOW);
    }

    private static ProjectContent content(ProjectComplexity complexity, long budget, List<ProjectMilestone> milestones) {
        return new ProjectContent("Landing page", "Summary", "Problem", "F&B", "1-10 nhân sự", complexity, budget,
                LocalDate.of(2026, 12, 1), List.of("react"), List.of("Works on mobile"), milestones);
    }
}
