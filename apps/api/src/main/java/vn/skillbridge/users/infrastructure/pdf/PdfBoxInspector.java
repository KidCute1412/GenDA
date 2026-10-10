package vn.skillbridge.users.infrastructure.pdf;

import java.io.IOException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException;
import org.springframework.stereotype.Component;
import vn.skillbridge.users.application.PdfInspector;

/** Opens the document structure only; nothing is rendered or extracted. */
@Component
class PdfBoxInspector implements PdfInspector {
    @Override
    public Inspection inspect(byte[] content) {
        try (PDDocument document = Loader.loadPDF(content)) {
            return new Readable(document.getNumberOfPages());
        } catch (InvalidPasswordException exception) {
            return new PasswordProtected();
        } catch (IOException | RuntimeException exception) {
            return new Unreadable();
        }
    }
}
