package vn.skillbridge.users.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.platform.api.ApiExceptionHandler;
import vn.skillbridge.users.application.ApplicationReadiness;
import vn.skillbridge.users.application.ApplicationReadinessService;
import vn.skillbridge.users.application.ContributorProfileService;
import vn.skillbridge.users.application.CvFile;
import vn.skillbridge.users.application.CvService;
import vn.skillbridge.users.application.EducationService;
import vn.skillbridge.users.application.ExperienceService;
import vn.skillbridge.users.application.UsersException;
import vn.skillbridge.users.domain.ContributorCv;
import vn.skillbridge.users.domain.CvPolicy;
import vn.skillbridge.users.domain.CvRejectionReason;
import vn.skillbridge.users.domain.CvStatus;
import vn.skillbridge.users.domain.Education;
import vn.skillbridge.users.domain.ExperiencePolicy;
import vn.skillbridge.users.domain.ExperienceRecord;
import vn.skillbridge.users.domain.ProjectLevel;

class ContributorControllersTest {
    private static final UUID USER_ID = UUID.fromString("40000000-0000-0000-0000-000000000001");
    private final ContributorProfileService profiles = mock(ContributorProfileService.class);
    private final EducationService education = mock(EducationService.class);
    private final CvService cvs = mock(CvService.class);
    private final ApplicationReadinessService readiness = mock(ApplicationReadinessService.class);
    private final ExperienceService experience = mock(ExperienceService.class);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new ContributorProfileController(profiles),
                    new EducationController(education), new CvController(cvs),
                    new ContributorStandingController(readiness, experience))
            .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
            .setControllerAdvice(new UsersExceptionHandler(), new ApiExceptionHandler())
            .build();

    @BeforeEach
    void authenticate() {
        var principal = new AuthenticatedPrincipal(USER_ID, "loc@example.com", "Lộc", "CONTRIBUTOR",
                AccountState.ACTIVE, null);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(principal, null));
    }

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void theProfileRequiresABackgroundType() throws Exception {
        mvc.perform(put("/api/v1/users/me/profile").contentType(MediaType.APPLICATION_JSON).content("""
                        {"displayName": "Lộc", "specialization": "Web", "skillCodes": ["react"]}
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void educationMonthsUseYearMonthAndRuleViolationsAre422() throws Exception {
        when(education.add(eq(USER_ID), any(Education.Details.class))).thenThrow(
                new vn.skillbridge.users.domain.ContributorRuleViolation("EDUCATION_INVALID_PERIOD", "bad"));

        mvc.perform(post("/api/v1/users/me/education").contentType(MediaType.APPLICATION_JSON).content("""
                        {"institution": "ĐH", "fieldOfStudy": "CNTT", "level": "BACHELOR",
                         "startMonth": "2026-13", "status": "CURRENTLY_STUDYING"}
                        """))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/v1/users/me/education").contentType(MediaType.APPLICATION_JSON).content("""
                        {"institution": "ĐH", "fieldOfStudy": "CNTT", "level": "BACHELOR",
                         "startMonth": "2027-01", "status": "CURRENTLY_STUDYING"}
                        """))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("EDUCATION_INVALID_PERIOD"));
    }

    @Test
    void uploadsACvAsMultipart() throws Exception {
        byte[] pdf = "%PDF-1.7".getBytes(StandardCharsets.US_ASCII);
        when(cvs.upload(USER_ID, "cv.pdf", "application/pdf", pdf)).thenReturn(new ContributorCv(USER_ID, "cv.pdf",
                pdf.length, 1, "0".repeat(64), CvStatus.READY, Instant.parse("2026-10-09T00:00:00Z")));

        mvc.perform(multipart(HttpMethod.PUT, "/api/v1/users/me/cv")
                        .file(new MockMultipartFile("file", "cv.pdf", "application/pdf", pdf)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READY"))
                .andExpect(jsonPath("$.pageCount").value(1));
    }

    @Test
    void aRejectedCvReportsItsReason() throws Exception {
        when(cvs.upload(eq(USER_ID), any(), any(), any())).thenThrow(CvPolicy.rejection(CvRejectionReason.NOT_PDF));

        mvc.perform(multipart(HttpMethod.PUT, "/api/v1/users/me/cv")
                        .file(new MockMultipartFile("file", "cv.pdf", "application/pdf", new byte[] {1})))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("CV_REJECTED_TECHNICAL"))
                .andExpect(jsonPath("$.details.reason").value("NOT_PDF"))
                .andExpect(jsonPath("$.details.maxBytes").value(CvPolicy.MAX_BYTES));
    }

    @Test
    void aMissingCvIs404() throws Exception {
        when(cvs.current(USER_ID)).thenReturn(Optional.empty());
        when(cvs.file(USER_ID)).thenThrow(new UsersException(UsersException.CV_NOT_FOUND, "none"));

        mvc.perform(get("/api/v1/users/me/cv")).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("CV_NOT_FOUND"));
        mvc.perform(get("/api/v1/users/me/cv/file")).andExpect(status().isNotFound());
    }

    @Test
    void servesTheOwnCvInlineWithoutCaching() throws Exception {
        when(cvs.file(USER_ID)).thenReturn(new CvFile("CV Lộc.pdf", new byte[] {'%', 'P', 'D', 'F'}));

        mvc.perform(get("/api/v1/users/me/cv/file"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Cache-Control", "no-store, private"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.startsWith("inline")));
    }

    @Test
    void readinessListsEveryChecklistItem() throws Exception {
        when(readiness.readiness(USER_ID)).thenReturn(new ApplicationReadiness(true, true, false));

        mvc.perform(get("/api/v1/users/me/readiness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cvReady").value(false))
                .andExpect(jsonPath("$.ready").value(false));
    }

    @Test
    void experienceCarriesTierProgressPolicyAndNewestFirstHistory() throws Exception {
        List<ExperienceRecord> records = new ArrayList<>();
        for (int index = 0; index < 11; index++) {
            records.add(new ExperienceRecord(UUID.randomUUID(), "Dự án " + index, "SME", ProjectLevel.BASIC,
                    Instant.parse("2026-01-01T00:00:00Z").plusSeconds(index * 86_400L)));
        }
        records.add(new ExperienceRecord(UUID.randomUUID(), "Landing page", "SME", ProjectLevel.MEDIUM,
                Instant.parse("2026-03-01T00:00:00Z")));
        when(experience.standing(USER_ID)).thenReturn(ExperiencePolicy.standard().evaluate(records));

        mvc.perform(get("/api/v1/users/me/experience"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalXp").value(12))
                .andExpect(jsonPath("$.tier").value("SILVER"))
                .andExpect(jsonPath("$.tierMinimumXp").value(10))
                .andExpect(jsonPath("$.nextTier").value("GOLD"))
                .andExpect(jsonPath("$.xpToNextTier").value(18))
                .andExpect(jsonPath("$.basicXpCap").value(10))
                .andExpect(jsonPath("$.tiers[2].selfApplyLevels.length()").value(3))
                .andExpect(jsonPath("$.levels[1].requiredTier").value("SILVER"))
                .andExpect(jsonPath("$.levels[1].unlocked").value(true))
                .andExpect(jsonPath("$.levels[2].unlocked").value(false))
                .andExpect(jsonPath("$.history[0].projectTitle").value("Landing page"))
                .andExpect(jsonPath("$.history[1].capped").value(true));
    }
}
