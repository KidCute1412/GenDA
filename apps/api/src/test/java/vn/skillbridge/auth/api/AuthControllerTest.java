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
import vn.skillbridge.auth.application.AuthException;
import vn.skillbridge.auth.application.account.RegistrationCommand;
import vn.skillbridge.auth.application.account.RegistrationResult;
import vn.skillbridge.auth.application.account.RegistrationService;
import vn.skillbridge.auth.application.emailverification.EmailVerificationService;
import vn.skillbridge.auth.application.session.CsrfTokenService;
import vn.skillbridge.auth.application.session.SessionService;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.account.UserRole;

class AuthControllerTest {
    private final RegistrationService registrations = mock(RegistrationService.class);
    private final AuthCookieWriter cookies = mock(AuthCookieWriter.class);
    private final EmailVerificationService emailVerifications = mock(EmailVerificationService.class);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new AuthController(
            mock(LoginService.class), registrations, emailVerifications, mock(SessionService.class), cookies,
            mock(CsrfTokenService.class))).build();

    @Test
    void registrationReturnsPendingAccountWithoutAuthenticationCookies() throws Exception {
        var user = new AuthUser(UUID.randomUUID(), "new@example.com", "hash", "New Contributor",
                UserRole.CONTRIBUTOR, false, AccountState.PENDING_EMAIL_VERIFICATION, null);
        when(registrations.register(any(RegistrationCommand.class))).thenReturn(new RegistrationResult(user));

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
                .andExpect(jsonPath("$.accountState").value("PENDING_EMAIL_VERIFICATION"))
                .andExpect(jsonPath("$.emailVerified").value(false))
                .andExpect(jsonPath("$.studentVerificationStatus").doesNotExist());

        verifyNoInteractions(cookies);
    }

    @Test
    void confirmationActivatesContributorWithoutIssuingCookies() throws Exception {
        var user = new AuthUser(UUID.randomUUID(), "new@example.com", "hash", "New Contributor",
                UserRole.CONTRIBUTOR, true, AccountState.ACTIVE, null);
        when(emailVerifications.confirm("new@example.com", "123456", "127.0.0.1")).thenReturn(user);

        mvc.perform(post("/api/v1/auth/email-verifications/confirm")
                        .with(request -> { request.setRemoteAddr("127.0.0.1"); return request; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"new@example.com","code":"123456"}
                                """))
                .andExpect(status().isOk())
                .andExpect(header().doesNotExist("Set-Cookie"))
                .andExpect(jsonPath("$.accountState").value("ACTIVE"))
                .andExpect(jsonPath("$.emailVerified").value(true));

        verifyNoInteractions(cookies);
    }

    @Test
    void confirmationRejectsAValueThatIsNotSixDigits() throws Exception {
        mvc.perform(post("/api/v1/auth/email-verifications/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"new@example.com","code":"12ab"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void resendIsAcceptedWithoutReturningAccountData() throws Exception {
        mvc.perform(post("/api/v1/auth/email-verifications/resend")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"new@example.com"}
                                """))
                .andExpect(status().isAccepted())
                .andExpect(header().doesNotExist("Set-Cookie"));
    }

    @Test
    void resendConcealsCooldownToPreventEmailEnumeration() throws Exception {
        doThrow(new AuthException("OTP_RESEND_TOO_SOON", "Wait before requesting another code"))
                .when(emailVerifications).resend("new@example.com", "127.0.0.1");

        mvc.perform(post("/api/v1/auth/email-verifications/resend")
                        .with(request -> { request.setRemoteAddr("127.0.0.1"); return request; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"new@example.com"}
                                """))
                .andExpect(status().isAccepted());
    }
}
