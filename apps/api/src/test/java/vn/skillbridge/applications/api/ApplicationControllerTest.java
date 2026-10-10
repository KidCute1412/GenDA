package vn.skillbridge.applications.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.LinkedHashMap;
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
import vn.skillbridge.applications.application.ApplicantReviewService;
import vn.skillbridge.applications.application.ApplicationException;
import vn.skillbridge.applications.application.ContributorApplicationService;
import vn.skillbridge.applications.domain.ApplicationRuleViolation;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.platform.api.ApiExceptionHandler;

class ApplicationControllerTest {
    private static final UUID USER = UUID.fromString("40000000-0000-0000-0000-000000000004");
    private final ContributorApplicationService applications = mock(ContributorApplicationService.class);
    private final ApplicantReviewService review = mock(ApplicantReviewService.class);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new ApplicationController(applications),
                    new SmeApplicationController(review))
            .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
            .setControllerAdvice(new ApplicationExceptionHandler(), new ApiExceptionHandler())
            .build();

    @BeforeEach
    void authenticate() {
        var principal = new AuthenticatedPrincipal(USER, "a@example.com", "Minh Anh", "CONTRIBUTOR",
                AccountState.ACTIVE, null);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(principal, null));
    }

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void anIneligibleApplicationExplainsEveryMissingCondition() throws Exception {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("missing", List.of("TIER_REQUIRED"));
        details.put("requiredTier", "SILVER");
        details.put("currentTier", "BRONZE");
        details.put("missingXp", 3);
        when(applications.apply(eq(USER), eq("p-zen"), any())).thenThrow(
                new ApplicationException(ApplicationException.NOT_ELIGIBLE, "not eligible", details));

        mvc.perform(post("/api/v1/applications").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"projectId\":\"p-zen\",\"coverLetter\":\"Thư ngỏ\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("APPLICATION_NOT_ELIGIBLE"))
                .andExpect(jsonPath("$.details.missing[0]").value("TIER_REQUIRED"))
                .andExpect(jsonPath("$.details.requiredTier").value("SILVER"))
                .andExpect(jsonPath("$.details.missingXp").value(3));
    }

    @Test
    void conflictsAre409() throws Exception {
        when(applications.apply(eq(USER), eq("p-zen"), any())).thenThrow(
                new ApplicationException(ApplicationException.ALREADY_APPLIED, "already"));
        UUID id = UUID.randomUUID();
        when(applications.withdraw(USER, id)).thenThrow(new ApplicationRuleViolation(
                ApplicationRuleViolation.INVALID_TRANSITION, "decided", Map.of("status", "ACCEPTED")));

        mvc.perform(post("/api/v1/applications").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"projectId\":\"p-zen\",\"coverLetter\":\"Thư ngỏ\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("APPLICATION_ALREADY_EXISTS"));
        mvc.perform(post("/api/v1/applications/{id}/withdraw", id))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.details.status").value("ACCEPTED"));
    }

    @Test
    void rejectsAnUnknownField() throws Exception {
        mvc.perform(post("/api/v1/applications").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"projectId\":\"\",\"coverLetter\":\"x\"}"))
                .andExpect(status().isBadRequest());
    }
}
