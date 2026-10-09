package vn.skillbridge.platform.infrastructure.config;

import com.zaxxer.hikari.HikariDataSource;
import java.sql.DriverManager;
import java.util.Arrays;
import java.util.Map;
import java.util.Properties;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.core.env.SystemEnvironmentPropertySource;
import org.springframework.core.io.ClassPathResource;
import static org.assertj.core.api.Assertions.assertThat;

class DataSourceConfigurationTest {
    @Test
    void fullJdbcUrlNeedsNoSeparateCredentials() throws Exception {
        String url = "jdbc:postgresql://localhost:5432/postgres?user=postgres.test"
                + "&password=p%26ss%23%2Bword&sslmode=require";
        runner(Map.of("SPRING_DATASOURCE_URL", url)).run(context -> {
            assertThat(context).hasNotFailed();
            HikariDataSource source = context.getBean(HikariDataSource.class);
            assertThat(source.getJdbcUrl()).isEqualTo(url);
            assertThat(source.getUsername()).isNull();
            assertThat(source.getPassword()).isNull();
        });
        var parameters = Arrays.stream(DriverManager.getDriver(url)
                .getPropertyInfo(url, new Properties())).toList();
        assertThat(parameters).anySatisfy(parameter -> {
            assertThat(parameter.name).isEqualTo("user");
            assertThat(parameter.value).isEqualTo("postgres.test");
        }).anySatisfy(parameter -> {
            assertThat(parameter.name).isEqualTo("password");
            assertThat(parameter.value).isEqualTo("p&ss#+word");
        });
    }

    @Test
    void localComposeCredentialsStillBind() {
        String url = "jdbc:postgresql://database:5432/genda";
        runner(Map.of("SPRING_DATASOURCE_URL", url,
                "SPRING_DATASOURCE_USERNAME", "genda",
                "SPRING_DATASOURCE_PASSWORD", "local-test-password")).run(context -> {
            assertThat(context).hasNotFailed();
            HikariDataSource source = context.getBean(HikariDataSource.class);
            assertThat(source.getJdbcUrl()).isEqualTo(url);
            assertThat(source.getUsername()).isEqualTo("genda");
            assertThat(source.getPassword()).isEqualTo("local-test-password");
        });
    }

    private ApplicationContextRunner runner(Map<String, Object> variables) {
        return new ApplicationContextRunner()
                .withConfiguration(AutoConfigurations.of(DataSourceAutoConfiguration.class))
                .withInitializer(context -> {
                    var sources = context.getEnvironment().getPropertySources();
                    sources.replace("systemEnvironment",
                            new SystemEnvironmentPropertySource("systemEnvironment", variables));
                    try {
                        for (var source : new YamlPropertySourceLoader().load("application",
                                new ClassPathResource("application.yml"))) {
                            sources.addLast(source);
                        }
                    } catch (java.io.IOException exception) {
                        throw new java.io.UncheckedIOException(exception);
                    }
                });
    }
}
