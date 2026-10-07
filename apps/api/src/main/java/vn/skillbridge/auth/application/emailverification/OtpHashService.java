package vn.skillbridge.auth.application.emailverification;

public interface OtpHashService {
    String hash(String rawCode);
    boolean matches(String rawCode, String hash);
}
