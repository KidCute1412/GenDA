package vn.skillbridge.projects.application;

/** Access or input failure in a project use case; {@code code} is the stable API error code. */
public class ProjectException extends RuntimeException {
    public static final String NOT_FOUND = "PROJECT_NOT_FOUND";
    public static final String SME_NOT_APPROVED = "SME_NOT_APPROVED";
    public static final String ADMIN_ROLE_REQUIRED = "ADMIN_ROLE_REQUIRED";
    public static final String UNKNOWN_SKILL = "UNKNOWN_SKILL";
    public static final String DUPLICATE_SKILL = "DUPLICATE_SKILL";

    private final String code;

    public ProjectException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String code() {
        return code;
    }
}
