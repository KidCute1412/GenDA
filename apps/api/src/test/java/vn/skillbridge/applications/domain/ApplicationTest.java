package vn.skillbridge.applications.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class ApplicationTest {
    private static final Instant NOW = Instant.parse("2026-10-09T03:00:00Z");
    private static final UUID CONTRIBUTOR = UUID.randomUUID();
    private static final UUID SME = UUID.randomUUID();
    private static final String LETTER = "Em đã làm ba dự án tương tự, có thể bàn giao bản nháp sau năm ngày và rảnh mọi buổi tối.";

    @Test
    void aNewApplicationIsSubmittedBySelfWithATrimmedLetter() {
        Application application = Application.submit(UUID.randomUUID(), "p-1", CONTRIBUTOR, "  " + LETTER + "  ", NOW);

        assertThat(application.status()).isEqualTo(ApplicationStatus.SUBMITTED);
        assertThat(application.eligibilitySource()).isEqualTo(EligibilitySource.SELF);
        assertThat(application.coverLetter()).isEqualTo(LETTER);
        assertThat(application.decidedAt()).isNull();
    }

    @Test
    void rejectsACoverLetterOutsideTheLengthBounds() {
        assertThatThrownBy(() -> Application.submit(UUID.randomUUID(), "p-1", CONTRIBUTOR, "Ngắn quá", NOW))
                .isInstanceOfSatisfying(ApplicationRuleViolation.class, violation -> {
                    assertThat(violation.code()).isEqualTo(ApplicationRuleViolation.COVER_LETTER_LENGTH);
                    assertThat(violation.details()).containsEntry("minimum", 80);
                });
        assertThatThrownBy(() -> Application.submit(UUID.randomUUID(), "p-1", CONTRIBUTOR, "x".repeat(3001), NOW))
                .isInstanceOf(ApplicationRuleViolation.class);
    }

    @Test
    void acceptanceAndRejectionRecordTheDecidingSme() {
        Application submitted = submitted();

        Application accepted = submitted.shortlist(NOW).accept(SME, NOW.plusSeconds(60));
        Application rejected = submitted().rejectForAcceptedPeer(SME, NOW.plusSeconds(60));

        assertThat(accepted.status()).isEqualTo(ApplicationStatus.ACCEPTED);
        assertThat(accepted.decidedBy()).isEqualTo(SME);
        assertThat(accepted.decidedAt()).isEqualTo(NOW.plusSeconds(60));
        assertThat(rejected.status()).isEqualTo(ApplicationStatus.REJECTED);
        assertThat(rejected.decidedBy()).isEqualTo(SME);
    }

    @Test
    void decidedApplicationsCannotBeWithdrawnOrDecidedAgain() {
        Application accepted = submitted().accept(SME, NOW);
        Application withdrawn = submitted().withdraw(NOW);

        assertInvalid(() -> accepted.withdraw(NOW));
        assertInvalid(() -> accepted.accept(SME, NOW));
        assertInvalid(() -> withdrawn.accept(SME, NOW));
        assertInvalid(() -> withdrawn.withdraw(NOW));
        assertInvalid(() -> submitted().shortlist(NOW).shortlist(NOW));
        assertThat(withdrawn.status().isActive()).isFalse();
        assertThat(accepted.status().isActive()).isTrue();
    }

    private static Application submitted() {
        return Application.submit(UUID.randomUUID(), "p-1", CONTRIBUTOR, LETTER, NOW);
    }

    private static void assertInvalid(org.assertj.core.api.ThrowableAssert.ThrowingCallable call) {
        assertThatThrownBy(call).isInstanceOfSatisfying(ApplicationRuleViolation.class,
                violation -> assertThat(violation.code()).isEqualTo(ApplicationRuleViolation.INVALID_TRANSITION));
    }
}
