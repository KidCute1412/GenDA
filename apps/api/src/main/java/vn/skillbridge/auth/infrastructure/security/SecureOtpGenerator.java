package vn.skillbridge.auth.infrastructure.security;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;
import vn.skillbridge.auth.application.emailverification.OtpGenerator;

@Component
class SecureOtpGenerator implements OtpGenerator {
    private final SecureRandom random = new SecureRandom();

    @Override
    public String generateSixDigitCode() {
        return "%06d".formatted(random.nextInt(1_000_000));
    }
}
