package vn.skillbridge.auth.application.emailverification;

import java.time.Duration;

public record EmailVerificationSettings(
        Duration otpTtl,
        Duration resendCooldown,
        Duration sourceRateWindow,
        Duration confirmationSourceRateWindow,
        int maxAttempts,
        int maxSendsPerSourceWindow,
        int maxConfirmAttemptsPerSourceWindow) {
}
