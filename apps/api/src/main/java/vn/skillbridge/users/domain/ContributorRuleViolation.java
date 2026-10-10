package vn.skillbridge.users.domain;

import java.util.Map;

/** A contributor-profile business rule rejected the request; {@code code} is the stable API error code. */
public class ContributorRuleViolation extends RuntimeException {
    public static final String EDUCATION_INVALID_PERIOD = "EDUCATION_INVALID_PERIOD";
    public static final String CV_REJECTED_TECHNICAL = "CV_REJECTED_TECHNICAL";

    private final String code;
    private final Map<String, Object> details;

    public ContributorRuleViolation(String code, String message) {
        this(code, message, Map.of());
    }

    public ContributorRuleViolation(String code, String message, Map<String, Object> details) {
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
