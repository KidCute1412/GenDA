package vn.skillbridge.applications.domain;

import java.util.Map;

/** An application rule rejected the request; {@code code} is the stable API error code. */
public class ApplicationRuleViolation extends RuntimeException {
    public static final String INVALID_TRANSITION = "APPLICATION_INVALID_TRANSITION";
    public static final String COVER_LETTER_LENGTH = "APPLICATION_COVER_LETTER_LENGTH";

    private final String code;
    private final Map<String, Object> details;

    public ApplicationRuleViolation(String code, String message, Map<String, Object> details) {
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
