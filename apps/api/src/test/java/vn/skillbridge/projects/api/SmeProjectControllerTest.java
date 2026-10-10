package vn.skillbridge.projects.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.platform.api.ApiExceptionHandler;
import vn.skillbridge.projects.application.ManagedProjectView;
import vn.skillbridge.projects.application.authoring.ProjectAuthoringService;
import vn.skillbridge.projects.application.authoring.ProjectDraftCommand;
import vn.skillbridge.projects.domain.ProjectRuleViolation;
import vn.skillbridge.projects.domain.ProjectStatus;
import vn.skillbridge.projects.domain.ReadinessIssue;

class SmeProjectControllerTest {
    private static final UUID SME = UUID.fromString("40000000-0000-0000-0000-000000000002");
    private final ProjectAuthoringService service = mock(ProjectAuthoringService.class);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new SmeProjectController(service))
            .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
            .setControllerAdvice(new ProjectExceptionHandler(), new ApiExceptionHandler())
            .build();

    @BeforeEach
    void authenticateSme() {
        var principal = new AuthenticatedPrincipal(SME, "contact@coffeelab.vn", "The Coffee Lab", "SME",
                AccountState.ACTIVE, true, "APPROVED");
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(principal, null));
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createsADraftFromATitleOnly() throws Exception {
        when(service.create(eq(SME), any(ProjectDraftCommand.class))).thenReturn(view());

        mvc.perform(post("/api/v1/sme/projects").contentType(MediaType.APPLICATION_JSON).content("""
                        {"title":"Landing page","skillCodes":[],"acceptanceCriteria":[],"milestones":[]}
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("p-1"))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.submissionIssues[0]").value("SUMMARY_REQUIRED"));
    }

    @Test
    void rejectsABudgetOutsideTheMvpRangeBeforeReachingTheUseCase() throws Exception {
        mvc.perform(post("/api/v1/sme/projects").contentType(MediaType.APPLICATION_JSON).content("""
                        {"title":"Landing page","budget":7000000,"skillCodes":[],"acceptanceCriteria":[],"milestones":[]}
                        """))
                .andExpect(status().isBadRequest());
        verify(service, never()).create(any(), any());
    }

    @Test
    void returnsTheLevelRangeWhenSubmissionIsOutsideIt() throws Exception {
        when(service.submit(SME, "p-1")).thenThrow(new ProjectRuleViolation(
                ProjectRuleViolation.BUDGET_OUTSIDE_LEVEL_RANGE, "Project budget is outside the range",
                Map.of("complexity", "BASIC", "minimumBudget", 1_000_000L, "maximumBudget", 1_500_000L,
                        "submittedBudget", 2_000_000L)));

        mvc.perform(post("/api/v1/sme/projects/p-1/submit"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("PROJECT_BUDGET_OUTSIDE_LEVEL_RANGE"))
                .andExpect(jsonPath("$.details.maximumBudget").value(1_500_000))
                .andExpect(jsonPath("$.requestId").isNotEmpty());
    }

    @Test
    void reportsAnInvalidTransitionAsConflict() throws Exception {
        when(service.submit(SME, "p-1")).thenThrow(new ProjectRuleViolation(
                ProjectRuleViolation.INVALID_TRANSITION, "Only a draft project can be submitted for review",
                Map.of("status", "PENDING_REVIEW")));

        mvc.perform(post("/api/v1/sme/projects/p-1/submit"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.details.status").value("PENDING_REVIEW"));
    }

    private static ManagedProjectView view() {
        Instant now = Instant.parse("2026-10-09T03:00:00Z");
        return new ManagedProjectView("p-1", ProjectStatus.DRAFT, "Landing page", null, null, null, null,
                "The Coffee Lab", "contact@coffeelab.vn", null, null, null, List.of(), List.of(), List.of(),
                List.of(ReadinessIssue.SUMMARY_REQUIRED), now, now, null, null, null);
    }
}
