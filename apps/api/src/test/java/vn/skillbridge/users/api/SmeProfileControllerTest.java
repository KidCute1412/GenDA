package vn.skillbridge.users.api;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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
import vn.skillbridge.users.application.SmeProfileService;
import vn.skillbridge.users.application.SmeProfileView;
import vn.skillbridge.users.application.UsersException;

class SmeProfileControllerTest {
    private final UUID userId = UUID.randomUUID();
    private final SmeProfileService profiles = mock(SmeProfileService.class);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new SmeProfileController(profiles))
            .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
            .setControllerAdvice(new UsersExceptionHandler(), new ApiExceptionHandler()).build();

    @BeforeEach
    void authenticate() {
        var principal = new AuthenticatedPrincipal(userId, "sme@example.com", "SME", "SME", AccountState.ACTIVE, null);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(principal, null));
    }

    @AfterEach
    void clear() { SecurityContextHolder.clearContext(); }

    @Test
    void readsAndUpdatesTheAuthenticatedAccount() throws Exception {
        var view = new SmeProfileView("SME", "sme@example.com", "0316789012", null, "Description", "IT");
        when(profiles.get(userId)).thenReturn(view);
        when(profiles.update(userId, "SME", "Description", "IT")).thenReturn(view);
        mvc.perform(get("/api/v1/users/me/sme-profile")).andExpect(status().isOk())
                .andExpect(jsonPath("$.taxCode").value("0316789012"));
        mvc.perform(put("/api/v1/users/me/sme-profile").contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"displayName":"SME","description":"Description","industry":"IT"}
                    """)).andExpect(status().isOk()).andExpect(jsonPath("$.industry").value("IT"));
        verify(profiles).update(userId, "SME", "Description", "IT");
    }

    @Test
    void rejectsBlankNameAndOversizedFields() throws Exception {
        for (String body : new String[] {"{\"displayName\":\" \"}",
                "{\"displayName\":\"" + "x".repeat(181) + "\"}",
                "{\"displayName\":\"SME\",\"description\":\"" + "x".repeat(2001) + "\"}",
                "{\"displayName\":\"SME\",\"industry\":\"" + "x".repeat(121) + "\"}"}) {
            mvc.perform(put("/api/v1/users/me/sme-profile").contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest());
        }
        verifyNoInteractions(profiles);
    }

    @Test
    void deniedAccountsReceive403() throws Exception {
        when(profiles.get(userId)).thenThrow(new UsersException(UsersException.SME_ROLE_REQUIRED, "Denied"));
        mvc.perform(get("/api/v1/users/me/sme-profile")).andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("SME_ROLE_REQUIRED"));
    }
}
