package vn.skillbridge.applications.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
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
import vn.skillbridge.applications.domain.Application;
import vn.skillbridge.applications.domain.ApplicationRuleViolation;
import vn.skillbridge.applications.domain.ApplicationStatus;
import vn.skillbridge.auth.application.account.AccountProfile;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.projects.application.staffing.ProjectStaffingService;
import vn.skillbridge.projects.application.staffing.StaffingProject;
import vn.skillbridge.users.application.ApplicationReadiness;
import vn.skillbridge.users.application.eligibility.ApplicationEligibility;
import vn.skillbridge.users.application.eligibility.ContributorEligibilityService;

class ContributorApplicationServiceTest {
    private static final UUID CONTRIBUTOR = UUID.fromString("40000000-0000-0000-0000-000000000004");
    private static final Instant NOW = Instant.parse("2026-10-09T03:00:00Z");
    private static final String LETTER = "Em đã làm ba dự án tương tự, có thể bàn giao bản nháp sau năm ngày và rảnh mọi buổi tối.";
    private final ApplicationRepository applications = mock(ApplicationRepository.class);
    private final ProjectStaffingService projects = mock(ProjectStaffingService.class);
    private final ContributorEligibilityService eligibility = mock(ContributorEligibilityService.class);
    private final AccountProfileService accounts = mock(AccountProfileService.class);
    private final ContributorApplicationService service = new ContributorApplicationService(applications, projects,
            eligibility, accounts, Clock.fixed(NOW, ZoneOffset.UTC));

    @BeforeEach
    void contributor() {
        when(accounts.get(CONTRIBUTOR)).thenReturn(new AccountProfile(CONTRIBUTOR, "a@example.com", "Minh Anh", "CONTRIBUTOR"));
    }

    @Test
    void aBronzeContributorCannotSelfApplyToMediumAndLearnsWhatIsMissing() {
        when(projects.lockForApplication("p-zen")).thenReturn(project("PUBLISHED", "MEDIUM"));
        when(eligibility.evaluate(CONTRIBUTOR, "MEDIUM")).thenReturn(new ApplicationEligibility(
                new ApplicationReadiness(true, true, false), "BRONZE", 7, "SILVER", 10, false));

        assertThatThrownBy(() -> service.apply(CONTRIBUTOR, "p-zen", LETTER))
                .isInstanceOfSatisfying(ApplicationException.class, exception -> {
                    assertThat(exception.code()).isEqualTo(ApplicationException.NOT_ELIGIBLE);
                    assertThat(exception.details()).containsEntry("missing", List.of("CV_NOT_READY", "TIER_REQUIRED"))
                            .containsEntry("requiredTier", "SILVER").containsEntry("currentTier", "BRONZE")
                            .containsEntry("missingXp", 3);
                });
        verify(applications, never()).save(any());
    }

    @Test
    void anEligibleContributorApplies() {
        when(projects.lockForApplication("p-zen")).thenReturn(project("PUBLISHED", "MEDIUM"));
        when(eligibility.evaluate(CONTRIBUTOR, "MEDIUM")).thenReturn(eligible());

        ContributorApplicationView view = service.apply(CONTRIBUTOR, "p-zen", LETTER);

        assertThat(view.application().status()).isEqualTo(ApplicationStatus.SUBMITTED);
        assertThat(view.application().submittedAt()).isEqualTo(NOW);
        verify(applications).save(view.application());
    }

    @Test
    void aProjectThatAlreadyStartedNoLongerAcceptsApplications() {
        when(projects.lockForApplication("p-zen")).thenReturn(project("IN_PROGRESS", "MEDIUM"));

        assertThatThrownBy(() -> service.apply(CONTRIBUTOR, "p-zen", LETTER)).isInstanceOfSatisfying(
                ApplicationException.class, exception -> assertThat(exception.code()).isEqualTo(ApplicationException.PROJECT_NOT_OPEN));
    }

    @Test
    void oneActiveApplicationPerProjectEvenUnderARace() {
        when(projects.lockForApplication("p-zen")).thenReturn(project("PUBLISHED", "MEDIUM"));
        when(eligibility.evaluate(CONTRIBUTOR, "MEDIUM")).thenReturn(eligible());
        when(applications.hasActive("p-zen", CONTRIBUTOR)).thenReturn(true, false);

        assertAlreadyApplied();
        doThrow(new ApplicationRepository.DuplicateApplicationException(new RuntimeException()))
                .when(applications).save(any());
        assertAlreadyApplied();
    }

    @Test
    void theCoverLetterRuleIsCheckedAfterEligibility() {
        when(projects.lockForApplication("p-zen")).thenReturn(project("PUBLISHED", "MEDIUM"));
        when(eligibility.evaluate(CONTRIBUTOR, "MEDIUM")).thenReturn(eligible());

        assertThatThrownBy(() -> service.apply(CONTRIBUTOR, "p-zen", "ngắn")).isInstanceOf(ApplicationRuleViolation.class);
    }

    @Test
    void anotherContributorsApplicationLooksMissing() {
        UUID id = UUID.randomUUID();
        Application foreign = Application.submit(id, "p-zen", UUID.randomUUID(), LETTER, NOW);
        when(applications.findByIdForUpdate(id)).thenReturn(Optional.of(foreign));

        assertThatThrownBy(() -> service.withdraw(CONTRIBUTOR, id)).isInstanceOfSatisfying(ApplicationException.class,
                exception -> assertThat(exception.code()).isEqualTo(ApplicationException.NOT_FOUND));
    }

    @Test
    void withdrawsAnOpenApplication() {
        UUID id = UUID.randomUUID();
        when(applications.findByIdForUpdate(id)).thenReturn(Optional.of(Application.submit(id, "p-zen", CONTRIBUTOR, LETTER, NOW)));
        when(projects.find(List.of("p-zen"))).thenReturn(Map.of("p-zen", project("PUBLISHED", "MEDIUM")));

        assertThat(service.withdraw(CONTRIBUTOR, id).application().status()).isEqualTo(ApplicationStatus.WITHDRAWN);
    }

    @Test
    void onlyContributorsApply() {
        UUID sme = UUID.randomUUID();
        when(accounts.get(sme)).thenReturn(new AccountProfile(sme, "sme@example.com", "SME", "SME"));

        assertThatThrownBy(() -> service.apply(sme, "p-zen", LETTER)).isInstanceOfSatisfying(ApplicationException.class,
                exception -> assertThat(exception.code()).isEqualTo(ApplicationException.CONTRIBUTOR_ROLE_REQUIRED));
    }

    private void assertAlreadyApplied() {
        assertThatThrownBy(() -> service.apply(CONTRIBUTOR, "p-zen", LETTER)).isInstanceOfSatisfying(
                ApplicationException.class, exception -> assertThat(exception.code()).isEqualTo(ApplicationException.ALREADY_APPLIED));
    }

    private static ApplicationEligibility eligible() {
        return new ApplicationEligibility(new ApplicationReadiness(true, true, true), "SILVER", 14, "SILVER", 10, true);
    }

    static StaffingProject project(String status, String complexity) {
        return new StaffingProject("p-zen", UUID.fromString("40000000-0000-0000-0000-000000000002"), "Zen Yoga",
                "Zen Yoga Studio", "studio@zenyoga.vn", status, complexity, 2_500_000L, LocalDate.of(2026, 12, 12),
                List.of("figma", "graphic-design"), null);
    }
}
