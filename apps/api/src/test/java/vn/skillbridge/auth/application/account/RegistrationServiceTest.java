package vn.skillbridge.auth.application.account;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.skillbridge.auth.application.AuthException;
import vn.skillbridge.auth.application.emailverification.EmailVerificationService;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.account.UserRole;

class RegistrationServiceTest {
    private final AuthUserRepository accounts = mock(AuthUserRepository.class);
    private final PasswordService passwords = mock(PasswordService.class);
    private final EmailVerificationService emailVerifications = mock(EmailVerificationService.class);
    private RegistrationService service;

    @BeforeEach
    void setUp() {
        service = new RegistrationService(accounts, passwords, emailVerifications);
        when(passwords.hash("Password@1")).thenReturn("new-hash");
    }

    @Test
    void registersContributorPendingEmailVerificationWithoutSession() {
        RegistrationResult result = service.register(new RegistrationCommand("New Student",
                "NEW.Student@example.com", "Password@1", UserRole.CONTRIBUTOR, null, null, "127.0.0.1"));

        assertThat(result.user().email()).isEqualTo("new.student@example.com");
        assertThat(result.user().emailVerified()).isFalse();
        assertThat(result.user().accountState()).isEqualTo(AccountState.PENDING_EMAIL_VERIFICATION);
        verify(accounts).create(any(AuthUser.class), org.mockito.ArgumentMatchers.eq(null),
                org.mockito.ArgumentMatchers.eq(null));
        verify(emailVerifications).issueInitial(result.user(), "127.0.0.1");
    }

    @Test
    void registersSmeAsPendingWithoutSession() {
        RegistrationResult result = service.register(new RegistrationCommand("New Company",
                "company@example.com", "Password@1", UserRole.SME, "0316789012001", null, "127.0.0.1"));

        assertThat(result.user().smeApprovalStatus()).isEqualTo("PENDING");
        assertThat(result.user().accountState()).isEqualTo(AccountState.PENDING_EMAIL_VERIFICATION);
        verify(accounts).create(any(AuthUser.class), org.mockito.ArgumentMatchers.eq("0316789012-001"),
                org.mockito.ArgumentMatchers.eq(null));
    }

    @Test
    void rejectsSmeWithoutValidIdentity() {
        assertThatThrownBy(() -> service.register(new RegistrationCommand("New Company",
                "company@example.com", "Password@1", UserRole.SME, null, "invalid", "127.0.0.1")))
                .isInstanceOf(AuthException.class)
                .extracting(exception -> ((AuthException) exception).code())
                .isEqualTo("SME_IDENTITY_REQUIRED");
    }

    @Test
    void rejectsAnAlreadyRegisteredEmail() {
        when(accounts.findByEmail("student@example.com")).thenReturn(Optional.of(mock(AuthUser.class)));

        assertThatThrownBy(() -> service.register(new RegistrationCommand("Student",
                "STUDENT@example.com", "Password@1", UserRole.CONTRIBUTOR, null, null, "127.0.0.1")))
                .isInstanceOf(AuthException.class)
                .extracting(exception -> ((AuthException) exception).code())
                .isEqualTo("EMAIL_ALREADY_REGISTERED");
    }
}
