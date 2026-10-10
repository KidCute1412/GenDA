package vn.skillbridge.applications.application;

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
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import vn.skillbridge.applications.domain.Application;
import vn.skillbridge.applications.domain.ApplicationRuleViolation;
import vn.skillbridge.applications.domain.ApplicationStatus;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.projects.application.staffing.ProjectStaffingService;
import vn.skillbridge.users.application.SkillQueryService;
import vn.skillbridge.users.application.SkillSummary;
import vn.skillbridge.users.application.eligibility.ApplicantProfile;
import vn.skillbridge.users.application.eligibility.ContributorEligibilityService;

class ApplicantReviewServiceTest {
    private static final UUID SME = UUID.fromString("40000000-0000-0000-0000-000000000002");
    private static final UUID FIGMA_PERSON = UUID.randomUUID();
    private static final UUID REACT_PERSON = UUID.randomUUID();
    private static final Instant NOW = Instant.parse("2026-10-09T03:00:00Z");
    private static final String LETTER = "Em đã làm ba dự án tương tự, có thể bàn giao bản nháp sau năm ngày và rảnh mọi buổi tối.";
    private final ApplicationRepository applications = mock(ApplicationRepository.class);
    private final ProjectStaffingService projects = mock(ProjectStaffingService.class);
    private final ContributorEligibilityService contributors = mock(ContributorEligibilityService.class);
    private final SkillQueryService skills = mock(SkillQueryService.class);
    private final AccountProfileService accounts = mock(AccountProfileService.class);
    private final ApplicantReviewService service = new ApplicantReviewService(applications, projects, contributors,
            skills, accounts, Clock.fixed(NOW, ZoneOffset.UTC));

    private final Application early = application(REACT_PERSON, NOW.minusSeconds(3600));
    private final Application late = application(FIGMA_PERSON, NOW.minusSeconds(60));

    @BeforeEach
    void setUp() {
        when(accounts.isApprovedSme(SME)).thenReturn(true);
        when(skills.findByCodes(any())).thenReturn(Map.of("figma", new SkillSummary("figma", "Figma")));
        when(contributors.applicants(anyCollection())).thenAnswer(invocation -> {
            Collection<UUID> ids = invocation.getArgument(0);
            return ids.stream().map(ApplicantReviewServiceTest::profile).toList();
        });
    }

    @Test
    void ranksApplicantsByMatchThenByWhoAppliedFirstAndHidesContactEmails() {
        when(projects.ownedBy(SME, "p-zen")).thenReturn(ContributorApplicationServiceTest.project("PUBLISHED", "MEDIUM"));
        Application withdrawn = application(UUID.randomUUID(), NOW).withdraw(NOW);
        when(applications.findByProject("p-zen")).thenReturn(List.of(early, late, withdrawn));

        ProjectApplicantsView view = service.applicants(SME, "p-zen");

        assertThat(view.applicants()).extracting(applicant -> applicant.application().contributorId())
                .containsExactly(FIGMA_PERSON, REACT_PERSON);
        assertThat(view.applicants().getFirst().match().percent()).isEqualTo(50);
        assertThat(view.applicants()).allSatisfy(applicant -> assertThat(applicant.contactEmail()).isNull());
    }

    @Test
    void acceptingOneStartsTheProjectAndRejectsTheOthers() {
        when(applications.findById(late.id())).thenReturn(Optional.of(late));
        when(projects.startWork(SME, "p-zen", FIGMA_PERSON)).thenReturn(ContributorApplicationServiceTest.project("IN_PROGRESS", "MEDIUM"));
        Application withdrawn = application(UUID.randomUUID(), NOW).withdraw(NOW);
        when(applications.findByProjectForUpdate("p-zen")).thenReturn(List.of(early, late, withdrawn));

        ApplicantView accepted = service.accept(SME, late.id());

        ArgumentCaptor<Application> saved = ArgumentCaptor.forClass(Application.class);
        verify(applications, org.mockito.Mockito.times(2)).save(saved.capture());
        List<Application> writes = new ArrayList<>(saved.getAllValues());
        assertThat(writes).extracting(Application::status)
                .containsExactlyInAnyOrder(ApplicationStatus.REJECTED, ApplicationStatus.ACCEPTED);
        assertThat(writes).allSatisfy(write -> assertThat(write.decidedBy()).isEqualTo(SME));
        assertThat(accepted.contactEmail()).isEqualTo(FIGMA_PERSON + "@example.com");
    }

    @Test
    void aWithdrawnApplicationCannotBeAcceptedAndTheTransactionRollsBack() {
        Application withdrawn = late.withdraw(NOW);
        when(applications.findById(late.id())).thenReturn(Optional.of(withdrawn));
        when(projects.startWork(SME, "p-zen", FIGMA_PERSON)).thenReturn(ContributorApplicationServiceTest.project("IN_PROGRESS", "MEDIUM"));
        when(applications.findByProjectForUpdate("p-zen")).thenReturn(List.of(early, withdrawn));

        assertThatThrownBy(() -> service.accept(SME, late.id())).isInstanceOf(ApplicationRuleViolation.class);
    }

    @Test
    void onlyApprovedSmesReview() {
        when(accounts.isApprovedSme(SME)).thenReturn(false);

        assertThatThrownBy(() -> service.applicants(SME, "p-zen")).isInstanceOfSatisfying(ApplicationException.class,
                exception -> assertThat(exception.code()).isEqualTo(ApplicationException.SME_NOT_APPROVED));
        verify(projects, never()).ownedBy(any(), any());
    }

    private static Application application(UUID contributor, Instant at) {
        return Application.submit(UUID.randomUUID(), "p-zen", contributor, LETTER, at);
    }

    private static ApplicantProfile profile(UUID id) {
        List<SkillSummary> declared = id.equals(FIGMA_PERSON)
                ? List.of(new SkillSummary("figma", "Figma")) : List.of(new SkillSummary("react", "React"));
        return new ApplicantProfile(id, "Người " + id, id + "@example.com", "STUDENT", "Thiết kế", declared, List.of(),
                "SILVER", 12, Map.of("BASIC", 10, "MEDIUM", 1, "HIGH", 0), null);
    }
}
