package vn.skillbridge.users.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class CvPolicyTest {
    private static final byte[] PDF = "%PDF-1.7\n...".getBytes(StandardCharsets.US_ASCII);

    @Test
    void acceptsAPdfByNameTypeAndSignature() {
        assertThat(CvPolicy.screen("cv.PDF", "application/pdf", PDF)).isEmpty();
    }

    @Test
    void rejectsEmptyAndOversizedFiles() {
        assertThat(CvPolicy.screen("cv.pdf", "application/pdf", new byte[0])).contains(CvRejectionReason.EMPTY);
        assertThat(CvPolicy.screen("cv.pdf", "application/pdf", new byte[CvPolicy.MAX_BYTES + 1]))
                .contains(CvRejectionReason.TOO_LARGE);
    }

    @Test
    void aRenamedFileIsNotAPdf() {
        byte[] png = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A};
        assertThat(CvPolicy.screen("cv.pdf", "application/pdf", png)).contains(CvRejectionReason.NOT_PDF);
        assertThat(CvPolicy.screen("cv.docx", "application/pdf", PDF)).contains(CvRejectionReason.NOT_PDF);
        assertThat(CvPolicy.screen("cv.pdf", "image/png", PDF)).contains(CvRejectionReason.NOT_PDF);
    }

    @Test
    void keepsOnlyASafeBaseName() {
        assertThat(CvPolicy.safeFileName("C:\\Users\\me\\CV <final>.pdf")).isEqualTo("CV final.pdf");
        assertThat(CvPolicy.safeFileName("../../etc/CV.pdf")).isEqualTo("CV.pdf");
        assertThat(CvPolicy.safeFileName("")).isEqualTo("CV.pdf");
        assertThat(CvPolicy.safeFileName("a".repeat(300) + ".pdf")).hasSize(255).endsWith(".pdf");
    }
}
