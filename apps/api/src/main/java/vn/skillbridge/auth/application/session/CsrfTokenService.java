package vn.skillbridge.auth.application.session;

public interface CsrfTokenService {
    String issue(String currentToken);
    boolean matches(String cookieToken, String headerToken);
}
