package vn.skillbridge.platform.infrastructure.config;

import java.time.Clock;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import static org.assertj.core.api.Assertions.assertThat;

class PlatformConfigurationTest {
    @Test
    void providesOneUtcClockAndRegistersTheConfiguredCorsPolicy() {
        new ApplicationContextRunner()
                .withUserConfiguration(TimeConfiguration.class, WebConfiguration.class)
                .withPropertyValues("app.cors.allowed-origins=http://localhost:3000,https://app.example.com")
                .run(context -> {
                    assertThat(context).hasNotFailed().hasSingleBean(Clock.class)
                            .hasSingleBean(WebMvcConfigurer.class);
                    assertThat(context.getBean(Clock.class).getZone()).isEqualTo(ZoneOffset.UTC);
                    var registry = new InspectableCorsRegistry();
                    context.getBean(WebMvcConfigurer.class).addCorsMappings(registry);
                    var policy = registry.policy();
                    assertThat(policy.getAllowedOrigins()).containsExactly(
                            "http://localhost:3000", "https://app.example.com");
                    assertThat(policy.getAllowedMethods()).containsExactly(
                            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
                    assertThat(policy.getAllowedHeaders()).containsExactly(
                            "Content-Type", "Authorization", "X-Request-ID", "X-CSRF-Token");
                    assertThat(policy.getAllowCredentials()).isTrue();
                    assertThat(policy.getMaxAge()).isEqualTo(3600L);
                });
    }

    private static class InspectableCorsRegistry extends CorsRegistry {
        org.springframework.web.cors.CorsConfiguration policy() {
            assertThat(getCorsConfigurations()).containsOnlyKeys("/api/v1/**");
            return getCorsConfigurations().get("/api/v1/**");
        }
    }
}
