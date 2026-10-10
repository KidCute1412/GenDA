package vn.skillbridge.auth.infrastructure;

import java.time.Clock;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.skillbridge.auth.application.AuthService.AuthSettings;
import vn.skillbridge.auth.application.PasswordVerifier;
import vn.skillbridge.auth.application.PasswordHasher;

@Configuration
@EnableConfigurationProperties(AuthProperties.class)
public class AuthInfrastructureConfiguration {
    @Bean
    Clock authClock() {
        return Clock.systemUTC();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    PasswordVerifier passwordVerifier(PasswordEncoder encoder) {
        return encoder::matches;
    }

    @Bean
    PasswordHasher passwordHasher(PasswordEncoder encoder) {
        return encoder::encode;
    }

    @Bean
    AuthSettings authSettings(AuthProperties properties) {
        return new AuthSettings(properties.accessTtl(), properties.refreshTtl(), properties.rememberedRefreshTtl());
    }
}
