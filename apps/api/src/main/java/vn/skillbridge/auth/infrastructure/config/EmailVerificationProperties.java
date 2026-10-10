package vn.skillbridge.auth.infrastructure.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.auth.email-verification")
public record EmailVerificationProperties(
        Duration otpTtl,
        Duration resendCooldown,
        Duration sourceRateWindow,
        Duration confirmationSourceRateWindow,
        int maxAttempts,
        int maxSendsPerSourceWindow,
        int maxConfirmAttemptsPerSourceWindow,
        String from) {
}
