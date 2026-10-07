package vn.skillbridge.auth.application.account;

public interface PasswordService {
    String hash(String rawPassword);

    boolean matches(String rawPassword, String passwordHash);
}
