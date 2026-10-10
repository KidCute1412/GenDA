package vn.skillbridge.auth.application.account;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.skillbridge.auth.application.AuthException;
import vn.skillbridge.auth.application.session.SessionIssuer;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.account.UserRole;

class LoginServiceTest {
    private final AuthUserRepository accounts = mock(AuthUserRepository.class);
    private final PasswordService passwords = mock(PasswordService.class);
    private final SessionIssuer sessions = mock(SessionIssuer.class);
    private LoginService service;
    private AuthUser user;

    @BeforeEach
    void setUp() {
        service = new LoginService(accounts, passwords, sessions);
        user = new AuthUser(UUID.randomUUID(), "student@example.com", "hash", "Student", UserRole.CONTRIBUTOR,
                true, AccountState.ACTIVE, null);
        when(accounts.findByEmail("student@example.com")).thenReturn(Optional.of(user));
        when(passwords.matches("Password@1", "hash")).thenReturn(true);
    }

    @Test
    void normalizesEmailAndIssuesSession() {
        service.login("STUDENT@example.com", "Password@1", true);

        verify(sessions).issue(user, true);
    }

    @Test
    void rejectsInvalidCredentialsWithoutRevealingWhichFieldFailed() {
        when(passwords.matches("wrong-password", "hash")).thenReturn(false);

        assertThatThrownBy(() -> service.login("student@example.com", "wrong-password", false))
                .isInstanceOf(AuthException.class)
                .extracting(exception -> ((AuthException) exception).code())
                .isEqualTo("INVALID_CREDENTIALS");
    }

    @Test
    void rejectsAnAccountPendingEmailVerification() {
        user = new AuthUser(user.id(), user.email(), user.passwordHash(), user.displayName(), user.role(),
                false, AccountState.PENDING_EMAIL_VERIFICATION, null);
        when(accounts.findByEmail("student@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.login("student@example.com", "Password@1", false))
                .isInstanceOf(AuthException.class)
                .extracting(exception -> ((AuthException) exception).code())
                .isEqualTo("EMAIL_VERIFICATION_REQUIRED");
    }

    @Test
    void rejectsADisabledAccount() {
        user = new AuthUser(user.id(), user.email(), user.passwordHash(), user.displayName(), user.role(),
                true, AccountState.DISABLED, null);
        when(accounts.findByEmail("student@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.login("student@example.com", "Password@1", false))
                .isInstanceOf(AuthException.class)
                .extracting(exception -> ((AuthException) exception).code())
                .isEqualTo("ACCOUNT_DISABLED");
    }
}
