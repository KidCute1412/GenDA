package vn.skillbridge.applications.application;

import java.util.Map;

/** Access or eligibility failure in an application use case; {@code code} is the stable API error code. */
public class ApplicationException extends RuntimeException {
    public static final String NOT_FOUND = "APPLICATION_NOT_FOUND";
    public static final String PROJECT_NOT_OPEN = "PROJECT_NOT_OPEN";
    public static final String ALREADY_APPLIED = "APPLICATION_ALREADY_EXISTS";
    public static final String NOT_ELIGIBLE = "APPLICATION_NOT_ELIGIBLE";
    public static final String CONTRIBUTOR_ROLE_REQUIRED = "CONTRIBUTOR_ROLE_REQUIRED";
    public static final String SME_NOT_APPROVED = "SME_NOT_APPROVED";
    public static final String CV_NOT_AVAILABLE = "CV_NOT_AVAILABLE";

    private final String code;
    private final Map<String, Object> details;

    public ApplicationException(String code, String message) {
        this(code, message, Map.of());
    }

    public ApplicationException(String code, String message, Map<String, Object> details) {
        super(message);
        this.code = code;
        this.details = Map.copyOf(details);
    }

    public String code() {
        return code;
    }

    public Map<String, Object> details() {
        return details;
    }
}
