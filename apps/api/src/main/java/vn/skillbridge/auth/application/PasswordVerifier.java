package vn.skillbridge.auth.application;

public interface PasswordVerifier {
    boolean matches(String rawPassword, String passwordHash);
}
