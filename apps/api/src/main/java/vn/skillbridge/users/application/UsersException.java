package vn.skillbridge.users.application;

public class UsersException extends RuntimeException {
    private final String code;

    public UsersException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String code() {
        return code;
    }
}
