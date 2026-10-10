package vn.skillbridge.users.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.sql.DriverManager;
import java.util.UUID;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import vn.skillbridge.users.application.SmeProfileService;

@SpringBootTest(properties = {
        "app.auth.jwt-secret=sme-profile-test-only-secret-at-least-32-bytes",
        "app.cors.allowed-origins=http://localhost:3010"
})
@EnabledIfEnvironmentVariable(named = "AUTH_TEST_DB_URL", matches = ".+")
class SmeProfilePersistenceIntegrationTest {
    private static final String SCHEMA = "sme_it_" + UUID.randomUUID().toString().replace("-", "");
    @Autowired SmeProfileService profiles;
    @Autowired JdbcTemplate db;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", () -> System.getenv("AUTH_TEST_DB_URL")
                + (System.getenv("AUTH_TEST_DB_URL").contains("?") ? "&" : "?") + "currentSchema=" + SCHEMA);
        properties.add("spring.datasource.username", () -> "auth_test");
        properties.add("spring.datasource.password", () -> "auth_test_only");
        properties.add("spring.flyway.schemas", () -> SCHEMA);
        properties.add("spring.flyway.default-schema", () -> SCHEMA);
        properties.add("spring.jpa.properties.hibernate.default_schema", () -> SCHEMA);
    }

    @AfterAll
    static void cleanup() throws Exception {
        try (var connection = DriverManager.getConnection(System.getenv("AUTH_TEST_DB_URL"), "auth_test", "auth_test_only");
                var statement = connection.createStatement()) {
            statement.execute("DROP SCHEMA IF EXISTS " + SCHEMA + " CASCADE");
        }
    }

    @Test
    void storesProfilesSeparatelyAndRollsBackTheNameWhenProfilePersistenceFails() {
        UUID owner = UUID.randomUUID();
        UUID other = UUID.randomUUID();
        for (UUID id : new UUID[] {owner, other}) {
            db.update("INSERT INTO app_users(id,email,password_hash,display_name,role,account_state,tax_code) "
                    + "VALUES (?,?,'hash','Registered SME','SME','ACTIVE','0316789012')", id, id + "@example.com");
        }
        assertThat(profiles.get(owner).description()).isNull();
        profiles.update(owner, "Updated SME", "Company description", "IT");
        assertThat(profiles.get(owner).displayName()).isEqualTo("Updated SME");
        assertThat(profiles.get(owner).description()).isEqualTo("Company description");
        assertThat(profiles.get(other).description()).isNull();
        assertThat(profiles.get(other).displayName()).isEqualTo("Registered SME");
        db.execute("ALTER TABLE sme_profiles ADD CONSTRAINT test_failure CHECK (industry <> 'FAIL')");
        assertThatThrownBy(() -> profiles.update(owner, "Must roll back", "Changed", "FAIL"))
                .isInstanceOf(RuntimeException.class);
        assertThat(profiles.get(owner).displayName()).isEqualTo("Updated SME");
        assertThat(profiles.get(owner).description()).isEqualTo("Company description");
        db.update("DELETE FROM app_users WHERE id = ?", owner);
        assertThat(db.queryForObject("SELECT count(*) FROM sme_profiles WHERE user_id = ?", Integer.class, owner)).isZero();
    }
}
