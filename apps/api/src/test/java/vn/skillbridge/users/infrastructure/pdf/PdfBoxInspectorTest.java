package vn.skillbridge.users.infrastructure.pdf;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.encryption.AccessPermission;
import org.apache.pdfbox.pdmodel.encryption.StandardProtectionPolicy;
import org.junit.jupiter.api.Test;
import vn.skillbridge.users.application.PdfInspector;

class PdfBoxInspectorTest {
    private final PdfBoxInspector inspector = new PdfBoxInspector();

    @Test
    void countsThePagesOfAReadablePdf() throws IOException {
        assertThat(inspector.inspect(pdf(3, null, null))).isEqualTo(new PdfInspector.Readable(3));
    }

    @Test
    void aPdfThatNeedsAPasswordToOpenIsPasswordProtected() throws IOException {
        assertThat(inspector.inspect(pdf(1, "open-me", "owner"))).isInstanceOf(PdfInspector.PasswordProtected.class);
    }

    @Test
    void ownerOnlyRestrictionsStillOpen() throws IOException {
        assertThat(inspector.inspect(pdf(1, "", "owner"))).isEqualTo(new PdfInspector.Readable(1));
    }

    @Test
    void aTruncatedFileIsUnreadable() {
        byte[] broken = "%PDF-1.7\n1 0 obj << /Type /Catalog".getBytes(StandardCharsets.US_ASCII);

        assertThat(inspector.inspect(broken)).isInstanceOf(PdfInspector.Unreadable.class);
    }

    private static byte[] pdf(int pages, String userPassword, String ownerPassword) throws IOException {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            for (int index = 0; index < pages; index++) {
                document.addPage(new PDPage());
            }
            if (ownerPassword != null) {
                var policy = new StandardProtectionPolicy(ownerPassword, userPassword, new AccessPermission());
                policy.setEncryptionKeyLength(128);
                document.protect(policy);
            }
            document.save(out);
            return out.toByteArray();
        }
    }
}
