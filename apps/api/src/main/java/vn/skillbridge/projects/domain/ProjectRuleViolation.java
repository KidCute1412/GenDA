package vn.skillbridge.projects.domain;

import java.util.Map;

/** A project business rule rejected the requested change; {@code code} is the stable API error code. */
public class ProjectRuleViolation extends RuntimeException {
    public static final String INVALID_TRANSITION = "PROJECT_INVALID_TRANSITION";
    public static final String NOT_READY = "PROJECT_NOT_READY";
    public static final String BUDGET_OUT_OF_RANGE = "PROJECT_BUDGET_OUT_OF_RANGE";
    public static final String BUDGET_OUTSIDE_LEVEL_RANGE = "PROJECT_BUDGET_OUTSIDE_LEVEL_RANGE";
    public static final String RETURN_REASON_REQUIRED = "PROJECT_RETURN_REASON_REQUIRED";

    private final String code;
    private final Map<String, Object> details;

    public ProjectRuleViolation(String code, String message) {
        this(code, message, Map.of());
    }

    public ProjectRuleViolation(String code, String message, Map<String, Object> details) {
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
