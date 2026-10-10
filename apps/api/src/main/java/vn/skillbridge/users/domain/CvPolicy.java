package vn.skillbridge.users.domain;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/** Technical acceptance rules for a CV file, checked before the PDF structure is inspected. */
public final class CvPolicy {
    public static final int MAX_BYTES = 2 * 1024 * 1024;
    private static final Set<String> PDF_CONTENT_TYPES = Set.of("application/pdf", "application/x-pdf");
    private static final byte[] PDF_SIGNATURE = "%PDF-".getBytes(StandardCharsets.US_ASCII);
    private static final int MAX_FILE_NAME_LENGTH = 255;

    private CvPolicy() {
    }

    /** Size, declared type, extension and file signature. Structural checks belong to the PDF inspector. */
    public static Optional<CvRejectionReason> screen(String fileName, String contentType, byte[] content) {
        if (content == null || content.length == 0) {
            return Optional.of(CvRejectionReason.EMPTY);
        }
        if (content.length > MAX_BYTES) {
            return Optional.of(CvRejectionReason.TOO_LARGE);
        }
        boolean pdfName = fileName != null && fileName.toLowerCase(Locale.ROOT).endsWith(".pdf");
        boolean pdfType = contentType != null
                && PDF_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT).split(";")[0].trim());
        boolean pdfSignature = content.length >= PDF_SIGNATURE.length
                && Arrays.equals(Arrays.copyOf(content, PDF_SIGNATURE.length), PDF_SIGNATURE);
        if (!pdfName || !pdfType || !pdfSignature) {
            return Optional.of(CvRejectionReason.NOT_PDF);
        }
        return Optional.empty();
    }

    public static ContributorRuleViolation rejection(CvRejectionReason reason) {
        return new ContributorRuleViolation(ContributorRuleViolation.CV_REJECTED_TECHNICAL,
                "The CV failed technical validation", Map.of("reason", reason.name(), "maxBytes", MAX_BYTES));
    }

    /** Keeps only the base name, drops control and reserved characters and bounds the length. */
    public static String safeFileName(String original) {
        String name = original == null ? "" : original;
        name = name.substring(Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\')) + 1);
        name = name.replaceAll("[\\p{Cntrl}\"<>|:*?]", "").trim();
        if (name.isEmpty() || name.equalsIgnoreCase(".pdf")) {
            name = "CV.pdf";
        }
        if (name.length() > MAX_FILE_NAME_LENGTH) {
            name = name.substring(0, MAX_FILE_NAME_LENGTH - 4) + ".pdf";
        }
        return name;
    }
}
