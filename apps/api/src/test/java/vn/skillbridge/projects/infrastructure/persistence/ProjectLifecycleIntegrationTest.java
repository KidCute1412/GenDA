package vn.skillbridge.projects.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.Filter;
import jakarta.servlet.http.Cookie;
import java.sql.DriverManager;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import vn.skillbridge.auth.application.session.CsrfTokenService;
import vn.skillbridge.auth.application.session.TokenService;
import vn.skillbridge.auth.domain.account.AccountState;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.account.UserRole;
import vn.skillbridge.projects.application.ProjectException;
import vn.skillbridge.projects.application.ProjectNotFoundException;
import vn.skillbridge.projects.application.ProjectQueryService;
import vn.skillbridge.projects.application.authoring.ProjectAuthoringService;
import vn.skillbridge.projects.application.authoring.ProjectDraftCommand;
import vn.skillbridge.projects.application.authoring.ProjectDraftCommand.MilestonePlanCommand;
import vn.skillbridge.projects.application.moderation.ProjectModerationService;
import vn.skillbridge.projects.domain.ProjectComplexity;
import vn.skillbridge.projects.domain.ProjectRuleViolation;
import vn.skillbridge.projects.domain.ProjectStatus;

/** Real Flyway/JPA transactions and the production HTTP security chain, in an isolated PostgreSQL schema. */
@SpringBootTest(properties = {
        "app.auth.jwt-secret=project-test-only-secret-at-least-32-bytes",
        "app.cors.allowed-origins=http://localhost:3010"
})
@EnabledIfEnvironmentVariable(named = "AUTH_TEST_DB_URL", matches = ".+")
class ProjectLifecycleIntegrationTest {
    private static final String SCHEMA = "project_it_" + UUID.randomUUID().toString().replace("-", "");
    @Autowired ProjectAuthoringService authoring;
    @Autowired ProjectModerationService moderation;
    @Autowired ProjectQueryService catalog;
    @Autowired JdbcTemplate db;
    @Autowired WebApplicationContext context;
    @Autowired TokenService tokens;
    @Autowired CsrfTokenService csrf;
    private UUID sme;
    private UUID otherSme;
    private UUID admin;
    private UUID contributor;
    private MockMvc mvc;

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

    @BeforeEach
    void fixtures() {
        sme = account(UserRole.SME);
        otherSme = account(UserRole.SME);
        admin = account(UserRole.ADMIN);
        contributor = account(UserRole.CONTRIBUTOR);
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .addFilters(context.getBean("springSecurityFilterChain", Filter.class)).build();
    }

    @Test
    void savesReplacesReturnsResubmitsAndPublishesWithoutLosingContentOrAudit() throws Exception {
        var draft = authoring.create(sme, new ProjectDraftCommand("Title only", null, null, null, null,
                null, null, null, List.of(), List.of(), List.of()));
        String id = draft.id();
        assertThat(authoring.getOwn(sme, id).title()).isEqualTo("Title only");
        assertThatThrownBy(() -> authoring.submit(sme, id)).isInstanceOf(ProjectRuleViolation.class);
        assertThatThrownBy(() -> catalog.getPublished(id)).isInstanceOf(ProjectNotFoundException.class);
        authoring.update(sme, id, content(List.of("react"), false));
        var revised = authoring.update(sme, id, content(List.of("figma", "typescript"), true));
        assertThat(revised.milestones()).hasSize(2);
        assertThat(authoring.getOwn(sme, id).skills()).extracting("code").containsExactly("figma", "typescript");
        assertThat(authoring.getOwn(sme, id).acceptanceCriteria()).containsExactly("Responsive", "Source included");
        assertThatThrownBy(() -> authoring.update(otherSme, id, content(List.of("react"), false)))
                .isInstanceOf(ProjectException.class).extracting("code").isEqualTo(ProjectException.NOT_FOUND);
        authoring.submit(sme, id);
        assertThat(moderation.pendingQueue(admin)).extracting("id").contains(id);
        assertThatThrownBy(() -> catalog.getPublished(id)).isInstanceOf(ProjectNotFoundException.class);
        assertThatThrownBy(() -> authoring.submit(sme, id)).isInstanceOf(ProjectRuleViolation.class);
        assertThatThrownBy(() -> authoring.update(sme, id, content(List.of("react"), false)))
                .isInstanceOf(ProjectRuleViolation.class);
        moderation.returnToDraft(admin, id, "Reduce the scope before publishing", ProjectComplexity.BASIC);
        var returned = authoring.getOwn(sme, id);
        assertThat(returned.latestReturn().reason()).isEqualTo("Reduce the scope before publishing");
        assertThat(returned.latestReturn().suggestedComplexity()).isEqualTo(ProjectComplexity.BASIC);
        assertThat(returned.milestones()).isEqualTo(revised.milestones());
        authoring.update(sme, id, content(List.of("react"), false));
        authoring.submit(sme, id);
        assertThat(authoring.getOwn(sme, id).latestReturn()).isNull();
        moderation.publish(admin, id);
        assertThat(catalog.getPublished(id).skills()).extracting("code").containsExactly("react");
        assertThat(catalog.getPublished(id).milestones()).hasSize(1);
        assertThat(authoring.getOwn(sme, id).publishedAt()).isNotNull();
        assertThatThrownBy(() -> moderation.publish(admin, id)).isInstanceOf(ProjectRuleViolation.class);
        assertThat(actions(id)).containsExactly("SUBMITTED", "RETURNED", "SUBMITTED", "PUBLISHED");
        assertThat(db.queryForObject("SELECT count(*) FROM project_moderation_events e JOIN projects p "
                + "ON p.id=e.project_id WHERE p.public_id=? AND e.actor_id=? AND e.occurred_at IS NOT NULL",
                Integer.class, id, admin)).isEqualTo(2);
        mvc.perform(get("/api/v1/projects").param("q", "Lifecycle project"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data[?(@.id == '" + id + "')]").isNotEmpty());
    }

    @Test
    void failedAuditInsertRollsBackPublication() {
        String id = pending();
        db.execute("ALTER TABLE project_moderation_events ADD CONSTRAINT test_publish_failure CHECK (action <> 'PUBLISHED')");
        try {
            assertThatThrownBy(() -> moderation.publish(admin, id)).isInstanceOf(RuntimeException.class);
            assertThat(authoring.getOwn(sme, id).status()).isEqualTo(ProjectStatus.PENDING_REVIEW);
            assertThat(authoring.getOwn(sme, id).publishedAt()).isNull();
            assertThat(actions(id)).containsExactly("SUBMITTED");
        } finally {
            db.execute("ALTER TABLE project_moderation_events DROP CONSTRAINT test_publish_failure");
        }
    }

    @Test
    void concurrentAdminDecisionsProduceOneTransitionAndOneAuditEvent() throws Exception {
        String id = pending();
        var ready = new CountDownLatch(2);
        var start = new CountDownLatch(1);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var publish = pool.submit(() -> decide(ready, start, () -> moderation.publish(admin, id)));
            var returned = pool.submit(() -> decide(ready, start,
                    () -> moderation.returnToDraft(admin, id, "Scope needs another review", null)));
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            assertThat(List.of(publish.get(20, TimeUnit.SECONDS), returned.get(20, TimeUnit.SECONDS)))
                    .containsExactlyInAnyOrder("OK", ProjectRuleViolation.INVALID_TRANSITION);
        }
        assertThat(actions(id)).hasSize(2);
        var state = authoring.getOwn(sme, id).status();
        assertThat(actions(id).get(1)).isEqualTo(state == ProjectStatus.PUBLISHED ? "PUBLISHED" : "RETURNED");
    }

    @Test
    void productionSecurityRejectsAnonymousWrongRoleWrongOwnerAndMissingCsrf() throws Exception {
        String id = pending();
        mvc.perform(get("/api/v1/sme/projects")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/admin/projects/pending")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/sme/projects").cookie(access(contributor, UserRole.CONTRIBUTOR)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/sme/projects/" + id).cookie(access(otherSme, UserRole.SME)))
                .andExpect(status().isNotFound());
        String token = csrf.issue(null);
        mvc.perform(post("/api/v1/admin/projects/" + id + "/publish").cookie(access(sme, UserRole.SME),
                new Cookie("genda_csrf", token)).header("X-CSRF-Token", token)).andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/admin/projects/" + id + "/publish").cookie(access(admin, UserRole.ADMIN)))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("CSRF_TOKEN_INVALID"));
        mvc.perform(put("/api/v1/sme/projects/" + id).cookie(access(otherSme, UserRole.SME),
                new Cookie("genda_csrf", token)).header("X-CSRF-Token", token)
                .contentType("application/json").content("""
                        {"title":"Forbidden","skillCodes":[],"acceptanceCriteria":[],"milestones":[]}
                        """)).andExpect(status().isNotFound());
        mvc.perform(post("/api/v1/admin/projects/" + id + "/return").cookie(access(admin, UserRole.ADMIN),
                new Cookie("genda_csrf", token)).header("X-CSRF-Token", token)
                .contentType("application/json").content("{\"reason\":\" \"}"))
                .andExpect(status().isBadRequest());
        assertThat(authoring.getOwn(sme, id).status()).isEqualTo(ProjectStatus.PENDING_REVIEW);
        assertThat(actions(id)).containsExactly("SUBMITTED");
        mvc.perform(post("/api/v1/admin/projects/" + id + "/publish").cookie(access(admin, UserRole.ADMIN),
                new Cookie("genda_csrf", token)).header("X-CSRF-Token", token)).andExpect(status().isOk());
    }

    @Test
    void publicationRechecksADeadlineThatExpiredDuringReview() {
        String id = pending();
        db.update("UPDATE projects SET deadline=? WHERE public_id=?", today(), id);
        assertThatThrownBy(() -> moderation.publish(admin, id)).isInstanceOf(ProjectRuleViolation.class)
                .extracting("code").isEqualTo(ProjectRuleViolation.NOT_READY);
        assertThat(authoring.getOwn(sme, id).status()).isEqualTo(ProjectStatus.PENDING_REVIEW);
        assertThat(actions(id)).containsExactly("SUBMITTED");
    }

    private UUID account(UserRole role) {
        UUID id = UUID.randomUUID();
        db.update("INSERT INTO app_users(id,email,password_hash,display_name,role,account_state,tax_code) "
                + "VALUES (?,?,'hash','Lifecycle Company',?,'ACTIVE',?)", id, id + "@example.com", role.name(),
                role == UserRole.SME ? "0316789012" : null);
        return id;
    }

    private Cookie access(UUID id, UserRole role) {
        return new Cookie("genda_access", tokens.issueAccessToken(new AuthUser(id, id + "@example.com", "hash",
                "Lifecycle Company", role, AccountState.ACTIVE, null), Instant.now(), Duration.ofMinutes(5)));
    }

    private String pending() {
        String id = authoring.create(sme, content(List.of("react"), false)).id();
        authoring.submit(sme, id);
        return id;
    }

    private List<String> actions(String id) {
        return db.queryForList("SELECT e.action FROM project_moderation_events e JOIN projects p ON p.id=e.project_id "
                + "WHERE p.public_id=? ORDER BY e.occurred_at", String.class, id);
    }

    private static LocalDate today() {
        return LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
    }

    private static ProjectDraftCommand content(List<String> skills, boolean split) {
        LocalDate deadline = today().plusDays(30);
        return new ProjectDraftCommand("Lifecycle project", "Summary", "Static landing page", "IT", "1-10",
                ProjectComplexity.BASIC, 1_500_000L, deadline, skills,
                split ? List.of("Responsive", "Source included") : List.of("Responsive"),
                split ? List.of(new MilestonePlanCommand("Design", 500_000, deadline.minusDays(7), List.of("Approved")),
                        new MilestonePlanCommand("Delivery", 1_000_000, deadline, List.of("Source included")))
                        : List.of(new MilestonePlanCommand("Delivery", 1_500_000, deadline, List.of())));
    }

    private static String decide(CountDownLatch ready, CountDownLatch start, Runnable action) throws Exception {
        ready.countDown();
        if (!start.await(10, TimeUnit.SECONDS)) throw new IllegalStateException("Concurrent decision timed out");
        try {
            action.run();
            return "OK";
        } catch (ProjectRuleViolation error) {
            return error.code();
        }
    }
}
