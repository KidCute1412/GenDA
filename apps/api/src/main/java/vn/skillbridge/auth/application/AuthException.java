package vn.skillbridge.auth.application;

public final class AuthException extends RuntimeException {
    private final String code;
    private final Long retryAfter;

    public AuthException(String code, String message) {
        this(code, message, null);
    }

    public AuthException(String code, String message, Long retryAfter) {
        super(message);
        this.code = code;
        this.retryAfter = retryAfter;
    }

    public String code() { return code; }
    public Long retryAfter() { return retryAfter; }
}
