package vn.skillbridge.projects.application.moderation;

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
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
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

class ProjectModerationServiceTest {
    private static final UUID ADMIN = UUID.fromString("40000000-0000-0000-0000-000000000003");
    private static final UUID SME = UUID.fromString("40000000-0000-0000-0000-000000000002");
    private static final Instant NOW = Instant.parse("2026-10-09T03:00:00Z");
    private final ProjectRepository projects = mock(ProjectRepository.class);
    private final ModerationEventRepository events = mock(ModerationEventRepository.class);
    private final SkillQueryService skills = mock(SkillQueryService.class);
    private final AccountProfileService accounts = mock(AccountProfileService.class);
    private final ProjectBudgetPolicy policy = ProjectBudgetPolicy.standard();
    private final ProjectCalendar calendar = new ProjectCalendar(Clock.fixed(NOW, ZoneOffset.UTC));
    private final ProjectModerationService service = new ProjectModerationService(projects, events,
            new ManagedProjectViews(skills, events, policy, calendar), accounts, policy, calendar);

    @BeforeEach
    void activeAdmin() {
        when(accounts.isActiveAdmin(ADMIN)).thenReturn(true);
        when(skills.findByCodes(anyCollection())).thenReturn(Map.of());
        when(events.findLatestByProjectIds(anyCollection())).thenReturn(Map.of());
    }

    @Test
    void onlyAnAdminCanReadTheQueue() {
        assertThatThrownBy(() -> service.pendingQueue(SME))
                .isInstanceOf(ProjectException.class)
                .extracting("code").isEqualTo(ProjectException.ADMIN_ROLE_REQUIRED);
    }

    @Test
    void publishingRecordsTheAdminDecision() {
        when(projects.findByIdForUpdate("p-1")).thenReturn(Optional.of(pending(ProjectComplexity.MEDIUM, 2_000_000)));

        var view = service.publish(ADMIN, "p-1");

        assertThat(view.status()).isEqualTo(ProjectStatus.PUBLISHED);
        ArgumentCaptor<ModerationEvent> event = ArgumentCaptor.forClass(ModerationEvent.class);
        verify(events).append(event.capture());
        assertThat(event.getValue().action()).isEqualTo(ModerationAction.PUBLISHED);
        assertThat(event.getValue().actorId()).isEqualTo(ADMIN);
    }

    @Test
    void publishingRevalidatesTheLevelBudgetRange() {
        // A row that reached review before the policy changed must not be published outside its range.
        Project stale = new Project("p-1", SME, "Coffee Lab", "sme@example.com", ProjectStatus.PENDING_REVIEW,
                content(ProjectComplexity.BASIC, 2_000_000), NOW, NOW, NOW, null, null);
        when(projects.findByIdForUpdate("p-1")).thenReturn(Optional.of(stale));

        assertThatThrownBy(() -> service.publish(ADMIN, "p-1"))
                .isInstanceOf(ProjectRuleViolation.class)
                .extracting("code").isEqualTo(ProjectRuleViolation.BUDGET_OUTSIDE_LEVEL_RANGE);
        verify(projects, never()).save(any());
    }

    @Test
    void returningKeepsTheSmeContentAndStoresTheReasonAndSuggestion() {
        Project pending = pending(ProjectComplexity.BASIC, 1_500_000);
        when(projects.findByIdForUpdate("p-1")).thenReturn(Optional.of(pending));

        var view = service.returnToDraft(ADMIN, "p-1", "Phạm vi gồm cả backend, cần level HIGH",
                ProjectComplexity.HIGH);

        ArgumentCaptor<Project> saved = ArgumentCaptor.forClass(Project.class);
        verify(projects).save(saved.capture());
        assertThat(saved.getValue().status()).isEqualTo(ProjectStatus.DRAFT);
        assertThat(saved.getValue().content()).isEqualTo(pending.content());
        ArgumentCaptor<ModerationEvent> event = ArgumentCaptor.forClass(ModerationEvent.class);
        verify(events).append(event.capture());
        assertThat(event.getValue().action()).isEqualTo(ModerationAction.RETURNED);
        assertThat(event.getValue().suggestedComplexity()).isEqualTo(ProjectComplexity.HIGH);
        assertThat(view.status()).isEqualTo(ProjectStatus.DRAFT);
    }

    @Test
    void returningWithoutAReasonChangesNothing() {
        when(projects.findByIdForUpdate("p-1")).thenReturn(Optional.of(pending(ProjectComplexity.BASIC, 1_500_000)));

        assertThatThrownBy(() -> service.returnToDraft(ADMIN, "p-1", "   ", null))
                .isInstanceOf(ProjectRuleViolation.class)
                .extracting("code").isEqualTo(ProjectRuleViolation.RETURN_REASON_REQUIRED);
        verify(projects, never()).save(any());
        verify(events, never()).append(any());
    }

    @Test
    void cannotModerateAProjectThatIsNotPending() {
        Project draft = Project.draft("p-1", SME, "Coffee Lab", "sme@example.com",
                content(ProjectComplexity.MEDIUM, 2_000_000), policy, NOW);
        when(projects.findByIdForUpdate("p-1")).thenReturn(Optional.of(draft));

        assertThatThrownBy(() -> service.publish(ADMIN, "p-1"))
                .isInstanceOf(ProjectRuleViolation.class)
                .extracting("code").isEqualTo(ProjectRuleViolation.INVALID_TRANSITION);
    }

    private Project pending(ProjectComplexity complexity, long budget) {
        return Project.draft("p-1", SME, "Coffee Lab", "sme@example.com", content(complexity, budget), policy, NOW)
                .submit(policy, LocalDate.of(2026, 10, 9), NOW);
    }

    private static ProjectContent content(ProjectComplexity complexity, long budget) {
        return new ProjectContent("Landing page", "Summary", "Problem", "F&B", "1-10 nhân sự", complexity, budget,
                LocalDate.of(2026, 12, 20), List.of("react"), List.of("Works on mobile"), List.of(
                        new ProjectMilestone("m1", 1, "Everything", budget, LocalDate.of(2026, 12, 20), List.of())));
    }
}
