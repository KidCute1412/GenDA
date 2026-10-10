package vn.skillbridge.projects.application.authoring;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import vn.skillbridge.auth.application.account.AccountProfile;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.projects.application.ManagedProjectViews;
import vn.skillbridge.projects.application.ModerationEventRepository;
import vn.skillbridge.projects.application.ProjectCalendar;
import vn.skillbridge.projects.application.ProjectException;
import vn.skillbridge.projects.application.ProjectRepository;
import vn.skillbridge.projects.domain.ModerationAction;
import vn.skillbridge.projects.domain.ModerationEvent;
import vn.skillbridge.projects.domain.Project;
import vn.skillbridge.projects.domain.ProjectBudgetPolicy;
import vn.skillbridge.projects.domain.ProjectComplexity;
import vn.skillbridge.projects.domain.ProjectContent;
import vn.skillbridge.projects.domain.ProjectMilestone;
import vn.skillbridge.projects.domain.ProjectRuleViolation;
import vn.skillbridge.projects.domain.ProjectStatus;
import vn.skillbridge.users.application.SkillQueryService;
import vn.skillbridge.users.application.SkillSummary;

class ProjectAuthoringServiceTest {
    private static final UUID SME = UUID.fromString("40000000-0000-0000-0000-000000000002");
    private static final UUID OTHER_SME = UUID.fromString("40000000-0000-0000-0000-000000000009");
    // 03:00 UTC is already 10:00 on 2026-10-09 in Vietnam.
    private static final Instant NOW = Instant.parse("2026-10-09T03:00:00Z");
    private final ProjectRepository projects = mock(ProjectRepository.class);
    private final ModerationEventRepository events = mock(ModerationEventRepository.class);
    private final SkillQueryService skills = mock(SkillQueryService.class);
    private final AccountProfileService accounts = mock(AccountProfileService.class);
    private final ProjectBudgetPolicy policy = ProjectBudgetPolicy.standard();
    private final ProjectCalendar calendar = new ProjectCalendar(Clock.fixed(NOW, ZoneOffset.UTC));
    private final ProjectAuthoringService service = new ProjectAuthoringService(projects, events,
            new ManagedProjectViews(skills, events, policy, calendar), skills, accounts, policy, calendar);

    @BeforeEach
    void approvedSme() {
        when(accounts.isApprovedSme(SME)).thenReturn(true);
        when(accounts.get(SME)).thenReturn(new AccountProfile(SME, "contact@coffeelab.vn", "The Coffee Lab", "SME"));
        Map<String, SkillSummary> catalog = new LinkedHashMap<>();
        catalog.put("react", new SkillSummary("react", "React"));
        catalog.put("figma", new SkillSummary("figma", "Figma"));
        when(skills.findByCodes(anyCollection())).thenAnswer(invocation -> {
            Map<String, SkillSummary> found = new LinkedHashMap<>();
            for (Object code : invocation.<Collection<?>>getArgument(0)) {
                if (catalog.containsKey(code)) found.put((String) code, catalog.get(code));
            }
            return found;
        });
        when(events.findLatestByProjectIds(anyCollection())).thenReturn(Map.of());
    }

    @Test
    void createsADraftOwnedByTheSmeWithNormalizedContent() {
        var view = service.create(SME, new ProjectDraftCommand("  Landing page  ", " ", null, "F&B", null,
                ProjectComplexity.MEDIUM, 2_000_000L, null, List.of(" React ", "FIGMA"),
                List.of(" Works on mobile ", "  "), List.of(new ProjectDraftCommand.MilestonePlanCommand(
                        " Wireframe ", 2_000_000, null, List.of()))));

        ArgumentCaptor<Project> saved = ArgumentCaptor.forClass(Project.class);
        verify(projects).save(saved.capture());
        Project project = saved.getValue();
        assertThat(project.ownerId()).isEqualTo(SME);
        assertThat(project.smeName()).isEqualTo("The Coffee Lab");
        assertThat(project.smeContact()).isEqualTo("contact@coffeelab.vn");
        assertThat(project.id()).matches("p-[0-9a-f]{12}");
        assertThat(project.content().title()).isEqualTo("Landing page");
        assertThat(project.content().summary()).isNull();
        assertThat(project.content().skillCodes()).containsExactly("react", "figma");
        assertThat(project.content().acceptanceCriteria()).containsExactly("Works on mobile");
        assertThat(project.content().milestones()).singleElement().satisfies(milestone -> {
            assertThat(milestone.id()).isEqualTo("m1");
            assertThat(milestone.title()).isEqualTo("Wireframe");
        });
        assertThat(view.status()).isEqualTo(ProjectStatus.DRAFT);
        assertThat(view.skills()).extracting(SkillSummary::name).containsExactly("React", "Figma");
        assertThat(view.submissionIssues()).isNotEmpty();
    }

    @Test
    void rejectsAnSmeThatIsNotApproved() {
        when(accounts.isApprovedSme(OTHER_SME)).thenReturn(false);

        assertThatThrownBy(() -> service.create(OTHER_SME, command(ProjectComplexity.BASIC, 1_200_000L)))
                .isInstanceOf(ProjectException.class)
                .extracting("code").isEqualTo(ProjectException.SME_NOT_APPROVED);
        verify(projects, never()).save(any());
    }

    @Test
    void rejectsSkillsOutsideTheCanonicalCatalog() {
        var command = new ProjectDraftCommand("Landing page", null, null, null, null, null, null, null,
                List.of("react", "made-up"), List.of(), List.of());

        assertThatThrownBy(() -> service.create(SME, command))
                .isInstanceOf(ProjectException.class)
                .extracting("code").isEqualTo(ProjectException.UNKNOWN_SKILL);
    }

    @Test
    void hidesProjectsOwnedByAnotherSme() {
        when(projects.findByIdForUpdate("p-other")).thenReturn(Optional.of(
                Project.draft("p-other", OTHER_SME, "Other", "other@example.com",
                        content(ProjectComplexity.BASIC, 1_200_000L), policy, NOW)));

        assertThatThrownBy(() -> service.update(SME, "p-other", command(ProjectComplexity.BASIC, 1_200_000L)))
                .isInstanceOf(ProjectException.class)
                .extracting("code").isEqualTo(ProjectException.NOT_FOUND);
    }

    @Test
    void submittingMovesTheDraftToReviewAndRecordsWhoSubmitted() {
        Project draft = Project.draft("p-1", SME, "The Coffee Lab", "contact@coffeelab.vn",
                content(ProjectComplexity.MEDIUM, 2_000_000L), policy, NOW);
        when(projects.findByIdForUpdate("p-1")).thenReturn(Optional.of(draft));

        var view = service.submit(SME, "p-1");

        assertThat(view.status()).isEqualTo(ProjectStatus.PENDING_REVIEW);
        ArgumentCaptor<ModerationEvent> event = ArgumentCaptor.forClass(ModerationEvent.class);
        verify(events).append(event.capture());
        assertThat(event.getValue().action()).isEqualTo(ModerationAction.SUBMITTED);
        assertThat(event.getValue().actorId()).isEqualTo(SME);
        assertThat(event.getValue().occurredAt()).isEqualTo(NOW);
    }

    @Test
    void submittingABudgetAboveTheLevelCeilingIsRejectedWithoutAnEvent() {
        Project draft = Project.draft("p-1", SME, "The Coffee Lab", "contact@coffeelab.vn",
                content(ProjectComplexity.BASIC, 2_000_000L), policy, NOW);
        when(projects.findByIdForUpdate("p-1")).thenReturn(Optional.of(draft));

        assertThatThrownBy(() -> service.submit(SME, "p-1"))
                .isInstanceOf(ProjectRuleViolation.class)
                .extracting("code").isEqualTo(ProjectRuleViolation.BUDGET_OUTSIDE_LEVEL_RANGE);
        verify(projects, never()).save(any());
        verify(events, never()).append(any());
    }

    private static ProjectContent content(ProjectComplexity complexity, long budget) {
        long first = budget / 2;
        return new ProjectContent("Landing page", "Summary", "Problem", "F&B", "1-10 nhân sự", complexity, budget,
                LocalDate.of(2026, 12, 20), List.of("react"), List.of("Works on mobile"), List.of(
                        new ProjectMilestone("m1", 1, "Wireframe", first,
                                LocalDate.of(2026, 11, 20), List.of()),
                        new ProjectMilestone("m2", 2, "Frontend", budget - first,
                                LocalDate.of(2026, 12, 20), List.of())));
    }

    private static ProjectDraftCommand command(ProjectComplexity complexity, Long budget) {
        long first = budget / 2;
        return new ProjectDraftCommand("Landing page", "Summary", "Problem", "F&B", "1-10 nhân sự", complexity,
                budget, LocalDate.of(2026, 12, 20), List.of("react"), List.of("Works on mobile"), List.of(
                        new ProjectDraftCommand.MilestonePlanCommand("Wireframe", first, LocalDate.of(2026, 11, 20),
                                List.of()),
                        new ProjectDraftCommand.MilestonePlanCommand("Frontend", budget - first,
                                LocalDate.of(2026, 12, 20), List.of())));
    }
}
