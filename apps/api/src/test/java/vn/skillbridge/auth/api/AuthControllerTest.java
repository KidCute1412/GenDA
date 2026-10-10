package vn.skillbridge.auth.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import vn.skillbridge.auth.application.account.LoginService;
import vn.skillbridge.auth.application.account.AuthRateLimitService;
import vn.skillbridge.auth.application.AuthException;
import vn.skillbridge.auth.application.account.RegistrationCommand;
import vn.skillbridge.auth.application.account.RegistrationService;
import vn.skillbridge.auth.application.session.CsrfTokenService;
import vn.skillbridge.auth.application.session.SessionService;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.account.UserRole;

class AuthControllerTest {
    private final RegistrationService registrations = mock(RegistrationService.class);
    private final AuthCookieWriter cookies = mock(AuthCookieWriter.class);
    private final AuthRateLimitService rateLimits = mock(AuthRateLimitService.class);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new AuthController(
            mock(LoginService.class), registrations, mock(SessionService.class), cookies,
            mock(CsrfTokenService.class), rateLimits)).setControllerAdvice(new AuthExceptionHandler()).build();

    @Test
    void registrationReturnsActiveAccountWithoutCreatingAnAuthSession() throws Exception {
        var user = new AuthUser(UUID.randomUUID(), "new@example.com", "hash", "New Contributor",
                UserRole.CONTRIBUTOR, AccountState.ACTIVE, null);
        when(registrations.register(any(RegistrationCommand.class))).thenReturn(user);

        mvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "New Contributor",
                                  "email": "new@example.com",
                                  "password": "Password@1",
                                  "role": "CONTRIBUTOR"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().doesNotExist("Set-Cookie"))
                .andExpect(jsonPath("$.accountState").value("ACTIVE"))
                .andExpect(jsonPath("$.studentVerificationStatus").doesNotExist());

        verifyNoInteractions(cookies);
    }

    @Test
    void rejectsPublicAdminRegistration() throws Exception {
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"new@example.com","name":"Admin","password":"Password@1","role":"ADMIN"}
                                """))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(registrations);
    }

    @Test
    void rateLimitReturnsRetryAfterAndDoesNotRegister() throws Exception {
        doThrow(new AuthException("AUTH_RATE_LIMITED", "Too many attempts", 3600L))
                .when(rateLimits).register("127.0.0.1");
        mvc.perform(post("/api/v1/auth/register")
                        .with(request -> { request.setRemoteAddr("127.0.0.1"); return request; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"new@example.com","name":"New","password":"Password@1","role":"CONTRIBUTOR"}
                                """))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("Retry-After", "3600"))
                .andExpect(jsonPath("$.code").value("AUTH_RATE_LIMITED"));
        verifyNoInteractions(registrations);
    }

}
