package vn.skillbridge.users.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.skillbridge.auth.application.account.AccountProfile;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.users.domain.ContributorCv;
import vn.skillbridge.users.domain.ContributorRuleViolation;
import vn.skillbridge.users.domain.CvStatus;

class CvServiceTest {
    private static final UUID USER_ID = UUID.fromString("40000000-0000-0000-0000-000000000001");
    private static final Instant NOW = Instant.parse("2026-10-09T03:00:00Z");
    private static final byte[] PDF = "%PDF-1.7 sample".getBytes(StandardCharsets.US_ASCII);
    private final CvRepository cvs = mock(CvRepository.class);
    private final PdfInspector inspector = mock(PdfInspector.class);
    private final AccountProfileService accounts = mock(AccountProfileService.class);
    private final CvService service = new CvService(cvs, inspector, new ContributorAccounts(accounts),
            Clock.fixed(NOW, ZoneOffset.UTC));

    @Test
    void aReadablePdfBecomesTheReadyCv() {
        contributor();
        when(inspector.inspect(PDF)).thenReturn(new PdfInspector.Readable(2));

        ContributorCv cv = service.upload(USER_ID, "CV Lộc.pdf", "application/pdf", PDF);

        assertThat(cv.status()).isEqualTo(CvStatus.READY);
        assertThat(cv.pageCount()).isEqualTo(2);
        assertThat(cv.fileName()).isEqualTo("CV Lộc.pdf");
        assertThat(cv.sha256()).hasSize(64);
        assertThat(cv.uploadedAt()).isEqualTo(NOW);
        verify(cvs).save(cv, PDF);
    }

    @Test
    void aPasswordProtectedPdfIsRejectedAndNothingIsStored() {
        contributor();
        when(inspector.inspect(PDF)).thenReturn(new PdfInspector.PasswordProtected());

        assertRejected(() -> service.upload(USER_ID, "cv.pdf", "application/pdf", PDF), "PASSWORD_PROTECTED");
        verify(cvs, never()).save(any(), any());
    }

    @Test
    void anUnreadableOrEmptyPdfIsCorrupted() {
        contributor();
        when(inspector.inspect(PDF)).thenReturn(new PdfInspector.Unreadable(), new PdfInspector.Readable(0));

        assertRejected(() -> service.upload(USER_ID, "cv.pdf", "application/pdf", PDF), "CORRUPTED");
        assertRejected(() -> service.upload(USER_ID, "cv.pdf", "application/pdf", PDF), "CORRUPTED");
    }

    @Test
    void screensTheFileBeforeParsingIt() {
        contributor();

        assertRejected(() -> service.upload(USER_ID, "cv.pdf", "application/pdf", "<html>".getBytes()), "NOT_PDF");
        verify(inspector, never()).inspect(any());
    }

    @Test
    void onlyContributorsHaveACv() {
        when(accounts.get(USER_ID)).thenReturn(new AccountProfile(USER_ID, "sme@example.com", "SME", "SME"));

        assertThatThrownBy(() -> service.current(USER_ID)).isInstanceOfSatisfying(UsersException.class,
                exception -> assertThat(exception.code()).isEqualTo(UsersException.CONTRIBUTOR_ROLE_REQUIRED));
    }

    private void contributor() {
        when(accounts.get(USER_ID)).thenReturn(new AccountProfile(USER_ID, "loc@example.com", "Lộc", "CONTRIBUTOR"));
    }

    private static void assertRejected(org.assertj.core.api.ThrowableAssert.ThrowingCallable call, String reason) {
        assertThatThrownBy(call).isInstanceOfSatisfying(ContributorRuleViolation.class, violation -> {
            assertThat(violation.code()).isEqualTo(ContributorRuleViolation.CV_REJECTED_TECHNICAL);
            assertThat(violation.details()).containsEntry("reason", reason);
        });
    }
}
