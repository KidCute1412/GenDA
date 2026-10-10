package vn.skillbridge.auth.application.emailverification;

import java.time.Instant;

public interface EmailSender {
    void sendVerificationCode(String email, String code, Instant expiresAt);
}
