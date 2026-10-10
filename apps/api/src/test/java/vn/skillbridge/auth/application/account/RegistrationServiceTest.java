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
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.account.UserRole;

class RegistrationServiceTest {
    private final AuthUserRepository accounts = mock(AuthUserRepository.class);
    private final PasswordService passwords = mock(PasswordService.class);
    private RegistrationService service;

    @BeforeEach
    void setUp() {
        service = new RegistrationService(accounts, passwords);
        when(passwords.hash("Password@1")).thenReturn("new-hash");
    }

    @Test
    void registersContributorActiveWithoutEmailVerification() {
        AuthUser result = service.register(new RegistrationCommand("New Student",
                "NEW.Student@example.com", "Password@1", UserRole.CONTRIBUTOR, null, null));

        assertThat(result.email()).isEqualTo("new.student@example.com");
        assertThat(result.accountState()).isEqualTo(AccountState.ACTIVE);
        verify(accounts).create(any(AuthUser.class), org.mockito.ArgumentMatchers.eq(null),
                org.mockito.ArgumentMatchers.eq(null));
    }

    @Test
    void registersSmeAsActiveWithoutEmailVerification() {
        AuthUser result = service.register(new RegistrationCommand("New Company",
                "company@example.com", "Password@1", UserRole.SME, "0316789012001", null));

        assertThat(result.smeApprovalStatus()).isNull();
        assertThat(result.accountState()).isEqualTo(AccountState.ACTIVE);
        verify(accounts).create(any(AuthUser.class), org.mockito.ArgumentMatchers.eq("0316789012-001"),
                org.mockito.ArgumentMatchers.eq(null));
    }

    @Test
    void rejectsSmeWithoutValidIdentity() {
        assertThatThrownBy(() -> service.register(new RegistrationCommand("New Company",
                "company@example.com", "Password@1", UserRole.SME, null, "invalid")))
                .isInstanceOf(AuthException.class)
                .extracting(exception -> ((AuthException) exception).code())
                .isEqualTo("SME_IDENTITY_REQUIRED");
    }

    @Test
    void rejectsAnAlreadyRegisteredEmail() {
        when(accounts.findByEmail("student@example.com")).thenReturn(Optional.of(mock(AuthUser.class)));

        assertThatThrownBy(() -> service.register(new RegistrationCommand("Student",
                "STUDENT@example.com", "Password@1", UserRole.CONTRIBUTOR, null, null)))
                .isInstanceOf(AuthException.class)
                .extracting(exception -> ((AuthException) exception).code())
                .isEqualTo("EMAIL_ALREADY_REGISTERED");
    }
}
