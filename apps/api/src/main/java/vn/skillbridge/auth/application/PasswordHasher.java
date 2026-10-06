package vn.skillbridge.auth.application;

public interface PasswordHasher {
    String hash(String rawPassword);
}

