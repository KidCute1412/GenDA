package vn.skillbridge.projects.application;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
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
    private final ProjectCatalog catalog = mock(ProjectCatalog.class);
    private final SkillQueryService skills = mock(SkillQueryService.class);
    private final ProjectQueryService service = new ProjectQueryService(catalog, skills);

    @Test
    void mapsSkillCodesAndPreservesPagingMetadata() {
        ProjectSearch search = new ProjectSearch(null, List.of("react"), null, null, 1, 12);
        when(catalog.findPublished(search)).thenReturn(new ProjectPage<>(List.of(project()), 1, 12, 1));
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
        when(catalog.findPublishedById("missing")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getPublished("missing"))
                .isInstanceOf(ProjectNotFoundException.class);
    }

    private PublishedProject project() {
        return new PublishedProject(
                "p-test", "Test project", "Test SME", "Technology", "1-10", "test@example.com",
                2_000_000, LocalDate.of(2027, 1, 1), "Summary", "Problem", List.of("react"),
                List.of("Done"), List.of(new ProjectMilestone("m1", 1, "First", 2_000_000,
                        LocalDate.of(2027, 1, 1), List.of("Done"))));
    }
}
