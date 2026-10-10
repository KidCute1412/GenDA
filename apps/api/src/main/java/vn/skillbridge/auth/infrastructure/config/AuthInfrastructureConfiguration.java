package vn.skillbridge.auth.infrastructure.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.skillbridge.auth.application.session.AuthCookieSettings;
import vn.skillbridge.auth.application.session.AuthSettings;

@Configuration
@EnableConfigurationProperties(AuthProperties.class)
public class AuthInfrastructureConfiguration {
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    AuthSettings authSettings(AuthProperties properties) {
        return new AuthSettings(properties.accessTtl(), properties.refreshTtl(), properties.rememberedRefreshTtl());
    }

    @Bean
    AuthCookieSettings authCookieSettings(AuthProperties properties) {
        return new AuthCookieSettings(properties.accessTtl(), properties.cookieSecure(), properties.cookieSameSite());
    }

}
