package vn.skillbridge.users.application;

public class UsersException extends RuntimeException {
    public static final String SME_ROLE_REQUIRED = "SME_ROLE_REQUIRED";
    public static final String CONTRIBUTOR_ROLE_REQUIRED = "CONTRIBUTOR_ROLE_REQUIRED";
    public static final String UNKNOWN_SKILL = "UNKNOWN_SKILL";
    public static final String DUPLICATE_SKILL = "DUPLICATE_SKILL";
    public static final String EDUCATION_NOT_FOUND = "EDUCATION_NOT_FOUND";
    public static final String EDUCATION_LIMIT_REACHED = "EDUCATION_LIMIT_REACHED";
    public static final String CV_NOT_FOUND = "CV_NOT_FOUND";

    private final String code;

    public UsersException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String code() {
        return code;
    }
}
