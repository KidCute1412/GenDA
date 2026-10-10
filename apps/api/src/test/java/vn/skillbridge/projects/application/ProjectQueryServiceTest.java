package vn.skillbridge.projects.application;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.skillbridge.auth.application.account.AccountProfile;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.projects.domain.ProjectBudgetPolicy;
import vn.skillbridge.projects.domain.ProjectComplexity;
import vn.skillbridge.projects.domain.ProjectMilestone;
import vn.skillbridge.projects.domain.PublishedProject;
import vn.skillbridge.users.application.SkillQueryService;
import vn.skillbridge.users.application.SkillSummary;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.anyCollection;

class ProjectQueryServiceTest {
    private final PublishedProjectRepository projects = mock(PublishedProjectRepository.class);
    private final SkillQueryService skills = mock(SkillQueryService.class);
    private final AccountProfileService accounts = mock(AccountProfileService.class);
    private final ProjectQueryService service = new ProjectQueryService(projects, skills,
            ProjectBudgetPolicy.standard(), accounts);

    @Test
    void mapsSkillCodesAndPreservesPagingMetadata() {
        ProjectSearch search = new ProjectSearch(null, List.of("react"), null, null, 1, 12);
        when(projects.findPublished(search)).thenReturn(new ProjectPage<>(List.of(project()), 1, 12, 1));
        when(skills.findByCodes(anyCollection())).thenReturn(Map.of("react", new SkillSummary("react", "React")));

        ProjectPage<ProjectView> result = service.browse(search);

        assertThat(result.total()).isEqualTo(1);
        assertThat(result.data()).singleElement().satisfies(project -> {
            assertThat(project.id()).isEqualTo("p-test");
            assertThat(project.skills()).containsExactly(new SkillSummary("react", "React"));
        });
    }

    @Test
    void rejectsUnknownOrUnpublishedProject() {
        when(projects.findPublishedById("missing")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getPublished("missing"))
                .isInstanceOf(ProjectNotFoundException.class);
    }

    @Test
    void includesTheProjectAuthorsDisplayNameOnDetail() {
        UUID ownerId = UUID.fromString("40000000-0000-0000-0000-000000000002");
        PublishedProject project = new PublishedProject("p-test", ownerId, "Test project", "Test SME",
                "Technology", "1-10", "test@example.com", ProjectComplexity.MEDIUM, 2_000_000,
                LocalDate.of(2027, 1, 1), "Summary", "Problem", List.of("react"), List.of("Done"), List.of());
        when(projects.findPublishedById("p-test")).thenReturn(Optional.of(project));
        when(accounts.get(ownerId)).thenReturn(new AccountProfile(ownerId, "poster@example.com", "Poster Name", "SME"));

        assertThat(service.getPublished("p-test").posterDisplayName()).isEqualTo("Poster Name");
    }

    @Test
    void exposesTheInclusiveBudgetRangeOfEveryLevel() {
        ProjectCreationPolicyView policy = service.creationPolicy();

        assertThat(policy.minimumBudget()).isEqualTo(1_000_000);
        assertThat(policy.maximumBudget()).isEqualTo(5_000_000);
        assertThat(policy.levels()).containsExactly(
                new ProjectCreationPolicyView.LevelView(ProjectComplexity.BASIC, 1_000_000, 1_500_000),
                new ProjectCreationPolicyView.LevelView(ProjectComplexity.MEDIUM, 1_500_000, 3_500_000),
                new ProjectCreationPolicyView.LevelView(ProjectComplexity.HIGH, 3_500_000, 5_000_000));
    }

    private PublishedProject project() {
        return new PublishedProject(
                "p-test", null, "Test project", "Test SME", "Technology", "1-10", "test@example.com",
                ProjectComplexity.MEDIUM, 2_000_000, LocalDate.of(2027, 1, 1), "Summary", "Problem", List.of("react"),
                List.of("Done"), List.of(new ProjectMilestone("m1", 1, "First", 2_000_000,
                        LocalDate.of(2027, 1, 1), List.of("Done"))));
    }
}
