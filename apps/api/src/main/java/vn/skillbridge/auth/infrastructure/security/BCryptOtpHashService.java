package vn.skillbridge.auth.infrastructure.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import vn.skillbridge.auth.application.emailverification.OtpHashService;

@Component
class BCryptOtpHashService implements OtpHashService {
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);

    @Override
    public String hash(String rawCode) {
        return encoder.encode(rawCode);
    }

    @Override
    public boolean matches(String rawCode, String hash) {
        return encoder.matches(rawCode, hash);
    }
}
