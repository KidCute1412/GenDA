package vn.skillbridge.auth.infrastructure.persistence.account;

import static org.assertj.core.api.Assertions.assertThat;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

@EnabledIfEnvironmentVariable(named = "AUTH_TEST_DB_URL", matches = ".+")
class AuthPersistenceIntegrationTest {
    @Test
    void removesOtpAndActivatesPreviouslyUnverifiedAccountsWithoutUnlockingDisabledAccounts() throws Exception {
        String url = System.getenv("AUTH_TEST_DB_URL");
        String schema = "auth_it_" + UUID.randomUUID().toString().replace("-", "");
        var configuration = Flyway.configure().dataSource(url, "auth_test", "auth_test_only")
                .schemas(schema).defaultSchema(schema).locations("classpath:db/migration");
        configuration.target("13").load().migrate();
        try (Connection db = DriverManager.getConnection(url, "auth_test", "auth_test_only")) {
            db.setSchema(schema);
            try {
                try (var statement = db.createStatement()) {
                    statement.execute("""
                            INSERT INTO app_users (id,email,password_hash,display_name,role,email_verified,
                              sme_approval_status,tax_code,account_state)
                            VALUES (gen_random_uuid(),'waiting@genda.test','hash','Waiting','SME',true,'PENDING','0316789012','EMAIL_VERIFIED'),
                              (gen_random_uuid(),'disabled@genda.test','hash','Disabled','SME',true,'REJECTED','0316789012','DISABLED'),
                              (gen_random_uuid(),'pending@genda.test','hash','Pending','SME',false,'PENDING','0316789012','PENDING_EMAIL_VERIFICATION')
                            """);
                }
                configuration.target("latest").load().migrate();
                try (var statement = db.createStatement(); var rows = statement.executeQuery("""
                        SELECT count(*) FROM information_schema.columns
                        WHERE table_schema = current_schema() AND table_name = 'app_users' AND column_name = 'email_verified'
                        """)) {
                    rows.next(); assertThat(rows.getInt(1)).isZero();
                }
                try (var statement = db.createStatement(); var rows = statement.executeQuery(
                        "SELECT to_regclass('auth_email_verification_challenges')")) {
                    rows.next(); assertThat(rows.getString(1)).isNull();
                }
                try (var statement = db.createStatement(); var rows = statement.executeQuery(
                        "SELECT email,account_state,sme_approval_status FROM app_users ORDER BY email")) {
                    rows.next(); assertThat(rows.getString(2)).isEqualTo("DISABLED");
                    rows.next(); assertThat(rows.getString(2)).isEqualTo("ACTIVE");
                    rows.next(); assertThat(rows.getString(2)).isEqualTo("ACTIVE");
                    assertThat(rows.getString(3)).isEqualTo("PENDING");
                }
                db.setAutoCommit(false);
                try (var statement = db.createStatement()) {
                    statement.execute("""
                            INSERT INTO app_users (id,email,password_hash,display_name,role,tax_code,account_state)
                            VALUES (gen_random_uuid(),'new@genda.test','hash','New','SME','0316789012','ACTIVE')
                            """);
                }
                db.rollback();
                try (var statement = db.createStatement(); var rows = statement.executeQuery("SELECT count(*) FROM app_users")) {
                    rows.next(); assertThat(rows.getInt(1)).isEqualTo(3);
                }
                db.setAutoCommit(true);
            } finally {
                db.setAutoCommit(true);
                try (var statement = db.createStatement()) { statement.execute("DROP SCHEMA " + schema + " CASCADE"); }
            }
        }
    }
}
