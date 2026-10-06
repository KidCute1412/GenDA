package vn.skillbridge.projects.api;

import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import vn.skillbridge.platform.api.ApiExceptionHandler;
import vn.skillbridge.projects.application.ProjectNotFoundException;
import vn.skillbridge.projects.application.ProjectPage;
import vn.skillbridge.projects.application.ProjectQueryService;
import vn.skillbridge.projects.application.ProjectSearch;
import vn.skillbridge.projects.application.ProjectView;
import vn.skillbridge.users.application.SkillSummary;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ProjectControllerTest {
    private final ProjectQueryService service = mock(ProjectQueryService.class);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new ProjectController(service))
            .setControllerAdvice(new ProjectExceptionHandler(), new ApiExceptionHandler()).build();

    @Test
    void returnsPagedPublishedProjects() throws Exception {
        when(service.browse(any(ProjectSearch.class))).thenReturn(new ProjectPage<>(List.of(project()), 1, 12, 1));

        mvc.perform(get("/api/v1/projects").param("skill", "react"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.pageSize").value(12))
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.data[0].id").value("p-test"))
                .andExpect(jsonPath("$.data[0].skills[0].code").value("react"));
    }

    @Test
    void rejectsAnInvertedBudgetRange() throws Exception {
        mvc.perform(get("/api/v1/projects").param("minBudget", "3000000").param("maxBudget", "2000000"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_PROJECT_FILTER"))
                .andExpect(jsonPath("$.requestId").isNotEmpty());
    }

    @Test
    void returnsStableNotFoundError() throws Exception {
        when(service.getPublished("missing")).thenThrow(new ProjectNotFoundException("missing"));
        mvc.perform(get("/api/v1/projects/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PROJECT_NOT_FOUND"))
                .andExpect(jsonPath("$.requestId").isNotEmpty());
    }

    private ProjectView project() {
        return new ProjectView(
                "p-test", "Test project", "Test SME", "Technology", "1-10", "test@example.com",
                2_000_000, LocalDate.of(2027, 1, 1), "Summary", "Problem",
                List.of(new SkillSummary("react", "React")), List.of("Done"), List.of());
    }
}
