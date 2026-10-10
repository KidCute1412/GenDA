package vn.skillbridge.users.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
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
import vn.skillbridge.platform.api.ApiExceptionHandler;
import vn.skillbridge.users.application.SkillSummary;
import vn.skillbridge.users.application.StudentProfileService;
import vn.skillbridge.users.application.StudentProfileView;
import vn.skillbridge.users.application.UpdateStudentProfileCommand;
import vn.skillbridge.users.domain.StudyYear;

class StudentProfileControllerTest {
    private static final UUID USER_ID = UUID.fromString("40000000-0000-0000-0000-000000000001");
    private final StudentProfileService service = mock(StudentProfileService.class);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new StudentProfileController(service))
            .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
            .setControllerAdvice(new UsersExceptionHandler(), new ApiExceptionHandler())
            .build();

    @BeforeEach
    void authenticateStudent() {
        var principal = new AuthenticatedPrincipal(USER_ID, "student@example.com", "Student", "STUDENT",
                true, "VERIFIED", null);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null));
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void returnsTheAuthenticatedStudentsProfile() throws Exception {
        when(service.get(USER_ID)).thenReturn(profile());

        mvc.perform(get("/api/v1/users/me/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("student@example.com"))
                .andExpect(jsonPath("$.studyYear").value("YEAR_3"))
                .andExpect(jsonPath("$.skills[0].code").value("react"));
    }

    @Test
    void updatesTheAuthenticatedStudentsProfile() throws Exception {
        when(service.update(eq(USER_ID), any(UpdateStudentProfileCommand.class))).thenReturn(profile());

        mvc.perform(put("/api/v1/users/me/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "displayName": "Lê Tuấn Lộc",
                                  "school": "ĐH Khoa học Tự nhiên",
                                  "major": "Công nghệ Thông tin",
                                  "studyYear": "YEAR_3",
                                  "skillCodes": ["react"]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.complete").value(true));
    }

    @Test
    void rejectsAnEmptySkillSelection() throws Exception {
        mvc.perform(put("/api/v1/users/me/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "displayName": "Lê Tuấn Lộc",
                                  "school": "ĐH Khoa học Tự nhiên",
                                  "major": "Công nghệ Thông tin",
                                  "studyYear": "YEAR_3",
                                  "skillCodes": []
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("HTTP_400"));
    }

    private StudentProfileView profile() {
        return new StudentProfileView(USER_ID, "student@example.com", "Lê Tuấn Lộc",
                "ĐH Khoa học Tự nhiên", "Công nghệ Thông tin", StudyYear.YEAR_3,
                List.of(new SkillSummary("react", "React")), "VERIFIED", true);
    }
}
