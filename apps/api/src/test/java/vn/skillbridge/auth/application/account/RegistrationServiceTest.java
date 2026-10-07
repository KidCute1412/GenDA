package vn.skillbridge.auth.application.account;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.skillbridge.auth.application.AuthException;
import vn.skillbridge.auth.application.session.AuthResult;
import vn.skillbridge.auth.application.session.SessionIssuer;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.account.UserRole;

class RegistrationServiceTest {
    private final AuthUserRepository accounts = mock(AuthUserRepository.class);
    private final PasswordService passwords = mock(PasswordService.class);
    private final SessionIssuer sessions = mock(SessionIssuer.class);
    private RegistrationService service;

    @BeforeEach
    void setUp() {
        service = new RegistrationService(accounts, passwords, sessions);
        when(passwords.hash("Password@1")).thenReturn("new-hash");
        when(sessions.issue(any(AuthUser.class), eq(false))).thenAnswer(invocation -> {
            AuthUser user = invocation.getArgument(0);
            return new AuthResult(user, "access", "refresh", Instant.parse("2026-10-08T00:00:00Z"));
        });
    }

    @Test
    void registersStudentAndIssuesSession() {
        RegistrationResult result = service.register(new RegistrationCommand("New Student",
                "NEW.Student@example.com", "Password@1", UserRole.STUDENT, null, null));

        assertThat(result.user().email()).isEqualTo("new.student@example.com");
        assertThat(result.user().emailVerified()).isFalse();
        assertThat(result.user().studentVerificationStatus()).isEqualTo("UNVERIFIED");
        assertThat(result.sessionIssued()).isTrue();
        verify(accounts).create(any(AuthUser.class), eq(null), eq(null));
    }

    @Test
    void registersSmeAsPendingWithoutSession() {
        RegistrationResult result = service.register(new RegistrationCommand("New Company",
                "company@example.com", "Password@1", UserRole.SME, "0316789012001", null));

        assertThat(result.user().smeApprovalStatus()).isEqualTo("PENDING");
        assertThat(result.sessionIssued()).isFalse();
        verify(accounts).create(any(AuthUser.class), eq("0316789012-001"), eq(null));
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
                "STUDENT@example.com", "Password@1", UserRole.STUDENT, null, null)))
                .isInstanceOf(AuthException.class)
                .extracting(exception -> ((AuthException) exception).code())
                .isEqualTo("EMAIL_ALREADY_REGISTERED");
    }
}
