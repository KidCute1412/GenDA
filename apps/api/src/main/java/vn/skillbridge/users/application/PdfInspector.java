package vn.skillbridge.users.application;

/** Parses a PDF without rendering it, to learn whether it opens and how many pages it has. */
public interface PdfInspector {
    Inspection inspect(byte[] content);

    sealed interface Inspection permits Readable, Unreadable, PasswordProtected {
    }

    record Readable(int pageCount) implements Inspection {
    }

    record Unreadable() implements Inspection {
    }

    /** Opening the document needs a password; owner-only restrictions still count as readable. */
    record PasswordProtected() implements Inspection {
    }
}
