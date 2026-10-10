package vn.skillbridge.users.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.skillbridge.users.domain.ExperiencePolicy;

@Configuration
class UsersConfiguration {
    /** XP weights, the BASIC cap and tier thresholds are server policy; the client renders what it receives. */
    @Bean
    ExperiencePolicy experiencePolicy() {
        return ExperiencePolicy.standard();
    }
}
