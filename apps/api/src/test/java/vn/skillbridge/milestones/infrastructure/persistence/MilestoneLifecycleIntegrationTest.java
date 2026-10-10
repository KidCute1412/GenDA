package vn.skillbridge.milestones.infrastructure.persistence;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.sql.DriverManager;
import java.time.*;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import jakarta.servlet.Filter;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import vn.skillbridge.auth.application.session.*;
import vn.skillbridge.auth.domain.account.*;
import vn.skillbridge.applications.application.ApplicantReviewService;
import vn.skillbridge.projects.application.authoring.*;
import vn.skillbridge.projects.application.moderation.ProjectModerationService;
import vn.skillbridge.projects.domain.ProjectComplexity;
import vn.skillbridge.milestones.application.*;
import vn.skillbridge.milestones.domain.*;

@SpringBootTest(properties={"app.auth.jwt-secret=milestone-it-only-secret-at-least-32-bytes","app.cors.allowed-origins=http://localhost:3010","app.milestones.gemini-key=","springdoc.api-docs.enabled=true"})
@EnabledIfEnvironmentVariable(named="AUTH_TEST_DB_URL",matches=".+")
class MilestoneLifecycleIntegrationTest {
    private static final String SCHEMA="milestone_it_"+UUID.randomUUID().toString().replace("-","");
    @Autowired JdbcTemplate db;
    @Autowired ProjectAuthoringService authoring;
    @Autowired ProjectModerationService moderation;
    @Autowired ApplicantReviewService applicants;
    @Autowired MilestoneService milestones;
    @Autowired AiReviewService ai;
    @Autowired AiReviewTransactions reviews;
    @MockitoBean ReviewModelService model;
    @Autowired MilestoneRepository repository;
    @Autowired AttachmentService attachments;
    @Autowired WebApplicationContext context;
    @Autowired TokenService tokens;
    @Autowired CsrfTokenService csrf;
    private UUID sme,contributor,other,admin;
    private String project;
    private MockMvc mvc;
    @DynamicPropertySource static void database(DynamicPropertyRegistry p){
        p.add("spring.datasource.url",()->System.getenv("AUTH_TEST_DB_URL")+"?currentSchema="+SCHEMA);
        p.add("spring.datasource.username",()->"auth_test");p.add("spring.datasource.password",()->"auth_test_only");
        p.add("spring.flyway.schemas",()->SCHEMA);p.add("spring.flyway.default-schema",()->SCHEMA);p.add("spring.jpa.properties.hibernate.default_schema",()->SCHEMA);
    }
    @AfterAll static void cleanup()throws Exception{try(var c=DriverManager.getConnection(System.getenv("AUTH_TEST_DB_URL"),"auth_test","auth_test_only");var s=c.createStatement()){s.execute("DROP SCHEMA "+SCHEMA+" CASCADE");}}
    @BeforeEach void fixtures(){
        sme=account(UserRole.SME);contributor=account(UserRole.CONTRIBUTOR);other=account(UserRole.SME);admin=account(UserRole.ADMIN);
        var deadline=LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(30);
        project=authoring.create(sme,new ProjectDraftCommand("Milestone integration","Summary","Static page","IT","1-10",ProjectComplexity.BASIC,1500000L,deadline,List.of("react"),List.of("Form"),List.of(
            new ProjectDraftCommand.MilestonePlanCommand("Design",500000,deadline,List.of("Name field")),new ProjectDraftCommand.MilestonePlanCommand("Delivery",1000000,deadline,List.of("Source"))))).id();
        authoring.submit(sme,project);moderation.publish(admin,project);
        UUID application=UUID.randomUUID();
        db.update("insert into applications(id,project_id,contributor_id,cover_letter,status,eligibility_source,submitted_at,updated_at) values(?,?,?,?,'SUBMITTED','SELF',now(),now())",application,project,contributor,"I can build this page and include source code. ".repeat(3));
        applicants.accept(sme,application);
        mvc=MockMvcBuilders.webAppContextSetup(context).addFilters(context.getBean("springSecurityFilterChain",Filter.class)).build();
    }
    @Test void acceptanceCreatesSnapshotAndRevisionHistoryCompletesProject(){
        var workspace=milestones.workspace(contributor,project);assertThat(workspace.milestones()).hasSize(2);
        var first=workspace.milestones().getFirst();var second=workspace.milestones().getLast();
        var one=milestones.submit(contributor,first.id(),0,"Name added",List.of(),List.of());
        milestones.decide(sme,first.id(),one.id(),false,"Need source");
        var two=milestones.submit(contributor,first.id(),1,"Name and source added",List.of(),List.of());
        milestones.decide(sme,first.id(),two.id(),true,null);
        assertThat(milestones.history(sme,first.id())).hasSize(2);
        assertThat(milestones.workspace(sme,project).milestones().getLast().status()).isEqualTo(Milestone.Status.IN_PROGRESS);
        var finalRevision=milestones.submit(contributor,second.id(),0,"Source provided",List.of(),List.of());
        milestones.decide(sme,second.id(),finalRevision.id(),true,null);
        assertThat(milestones.workspace(contributor,project).project().status()).isEqualTo("COMPLETED");
        assertThat(milestones.workspace(sme,project).milestones().getFirst().criteria()).isEqualTo(first.criteria());
        assertThat(db.queryForObject("select count(*) from milestone_events where milestone_id=?",Integer.class,first.id())).isEqualTo(4);
    }
    @Test void missingAiDoesNotBlockHumanDecisionsAndStaleRevisionCannotBeReviewed(){
        var m=milestones.workspace(contributor,project).milestones().getFirst();
        var h=milestones.submit(contributor,m.id(),0,"Evidence",List.of(),List.of());
        assertThatThrownBy(()->ai.run(contributor,m.id(),h.id())).isInstanceOf(MilestoneViolation.class).hasMessageContaining("not configured");
        milestones.decide(sme,m.id(),h.id(),false,"Update");
        var next=milestones.submit(contributor,m.id(),1,"Updated",List.of(),List.of());
        assertThatThrownBy(()->milestones.decide(sme,m.id(),h.id(),true,null)).isInstanceOf(MilestoneViolation.class);
        milestones.decide(sme,m.id(),next.id(),true,null);
    }
    @Test void enforcesHttpOwnershipCsrfAndRejectsContributorDecisions()throws Exception{
        var m=milestones.workspace(sme,project).milestones().getFirst();
        mvc.perform(get("/api/v1/projects/"+project+"/workspace")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/projects/"+project+"/workspace").cookie(access(other,UserRole.SME))).andExpect(status().isNotFound());
        mvc.perform(post("/api/v1/milestones/"+m.id()+"/submissions").cookie(access(contributor,UserRole.CONTRIBUTOR)).contentType("application/json").content("{\"expectedRevision\":0,\"note\":\"Evidence\",\"links\":[],\"attachmentIds\":[]}")).andExpect(status().isForbidden());
        var h=milestones.submit(contributor,m.id(),0,"Evidence",List.of(),List.of());String token=csrf.issue(null);
        mvc.perform(post("/api/v1/milestones/"+m.id()+"/submissions/"+h.id()+"/decision").cookie(access(contributor,UserRole.CONTRIBUTOR),new Cookie("genda_csrf",token)).header("X-CSRF-Token",token).contentType("application/json").content("{\"decision\":\"ACCEPTED\"}")).andExpect(status().isForbidden());
        assertThatThrownBy(()->milestones.submit(other,m.id(),1,"Other",List.of(),List.of())).isInstanceOf(MilestoneViolation.class);
    }
    @Test void rollsBackRevisionAndStateWhenAuditFails(){
        var m=milestones.workspace(sme,project).milestones().getFirst();
        db.execute("alter table milestone_events add constraint fail_milestone_audit check(action <> 'SUBMITTED') not valid");
        try{assertThatThrownBy(()->milestones.submit(contributor,m.id(),0,"Evidence",List.of(),List.of())).isInstanceOf(RuntimeException.class);}
        finally{db.execute("alter table milestone_events drop constraint fail_milestone_audit");}
        assertThat(milestones.history(sme,m.id())).isEmpty();assertThat(milestones.workspace(sme,project).milestones().getFirst().revision()).isZero();
    }
    @Test void concurrentDecisionsCommitExactlyOne()throws Exception{
        var m=milestones.workspace(sme,project).milestones().getFirst();var h=milestones.submit(contributor,m.id(),0,"Evidence",List.of(),List.of());
        try(var pool=Executors.newFixedThreadPool(2)){
            var ready=new CountDownLatch(2);var start=new CountDownLatch(1);
            Callable<Boolean> task=()->{ready.countDown();start.await(5,TimeUnit.SECONDS);try{milestones.decide(sme,m.id(),h.id(),true,null);return true;}catch(MilestoneViolation e){return false;}};
            var a=pool.submit(task);var b=pool.submit(task);ready.await(5,TimeUnit.SECONDS);start.countDown();assertThat(List.of(a.get(10,TimeUnit.SECONDS),b.get(10,TimeUnit.SECONDS))).containsExactlyInAnyOrder(true,false);
        }
    }
    @Test void openApiIncludesSuccessSchemasAndRevisionConcurrencyInput()throws Exception{
        mvc.perform(get("/api/v1/openapi")).andExpect(status().isOk())
            .andExpect(jsonPath("$.components.schemas.WorkspaceResponse.properties.milestones").exists())
            .andExpect(jsonPath("$.components.schemas.AiReviewResponse.properties.items").exists())
            .andExpect(jsonPath("$.components.schemas.SubmitHandoffRequest.required").isArray());
    }
    @Test void cancelledProjectsCannotAcceptOrOpenAnotherMilestone(){
        var m=milestones.workspace(sme,project).milestones().getFirst();
        var h=milestones.submit(contributor,m.id(),0,"Evidence",List.of(),List.of());
        db.update("update projects set status='CANCELLED' where public_id=?",project);
        assertThatThrownBy(()->milestones.decide(sme,m.id(),h.id(),true,null)).isInstanceOf(MilestoneViolation.class);
        assertThat(milestones.workspace(sme,project).milestones().getFirst().status()).isEqualTo(Milestone.Status.SUBMITTED);
    }
    @Test void attachmentsMustBelongToTheContributorAndExactMilestone(){
        var all=milestones.workspace(sme,project).milestones();var first=all.getFirst();var second=all.getLast();
        UUID wrongMilestone=UUID.randomUUID(),wrongOwner=UUID.randomUUID(),privateDraft=UUID.randomUUID();
        repository.save(new Attachment(wrongMilestone,second.id(),null,contributor,"other.txt","text/plain",5,"test-"+wrongMilestone,Instant.now()));
        repository.save(new Attachment(wrongOwner,first.id(),null,other,"other.txt","text/plain",5,"test-"+wrongOwner,Instant.now()));
        repository.save(new Attachment(privateDraft,first.id(),null,contributor,"draft.txt","text/plain",5,"test-"+privateDraft,Instant.now()));
        assertThatThrownBy(()->milestones.submit(contributor,first.id(),0,"Evidence",List.of(),List.of(wrongMilestone))).isInstanceOf(MilestoneViolation.class);
        assertThatThrownBy(()->milestones.submit(contributor,first.id(),0,"Evidence",List.of(),List.of(wrongOwner))).isInstanceOf(MilestoneViolation.class);
        assertThatThrownBy(()->attachments.download(sme,privateDraft)).isInstanceOf(MilestoneViolation.class);
        assertThatThrownBy(()->attachments.download(other,privateDraft)).isInstanceOf(MilestoneViolation.class);
    }
    @Test void sharesProcessingAndCachedReportsAndEnforcesPersistentActorQuota(){
        org.mockito.Mockito.when(model.available()).thenReturn(true);
        org.mockito.Mockito.when(model.model()).thenReturn("test-model");
        var m=milestones.workspace(sme,project).milestones().getFirst();
        var h=milestones.submit(contributor,m.id(),0,"Evidence",List.of(),List.of());
        var first=reviews.begin(contributor,m.id(),h.id());
        var processing=reviews.begin(sme,m.id(),h.id());
        assertThat(processing.run()).isFalse();assertThat(processing.review().id()).isEqualTo(first.review().id());
        var sources=List.of(new ReviewReport.Source("handoff-note","Note",null,"Evidence"));
        var report=new ReviewReport(List.of(new ReviewReport.Item(m.criteria().getFirst().id(),ReviewReport.EvidenceStatus.EVIDENCE_FOUND,List.of(new ReviewReport.Quote("handoff-note","Evidence")),null)),"Advisory");
        reviews.finish(first.review(),new ReviewModelService.Result(report,1L,1L),sources,List.of(),null);
        assertThat(reviews.begin(sme,m.id(),h.id()).review().state()).isEqualTo("SUCCEEDED");
        milestones.decide(sme,m.id(),h.id(),false,"Update");
        var next=milestones.submit(contributor,m.id(),1,"More evidence",List.of(),List.of());
        for(int i=0;i<9;i++)repository.save(new AiReview(UUID.randomUUID(),next.id(),contributor,"FAILED","gemini","test-model","milestone-v1",Instant.now(),Instant.now(),null,List.of(),List.of(),"AI_UNAVAILABLE",null,null));
        assertThatThrownBy(()->reviews.begin(contributor,m.id(),next.id())).isInstanceOfSatisfying(MilestoneViolation.class,e->assertThat(e.code()).isEqualTo("AI_RATE_LIMIT"));
        assertThat(repository.attempts(contributor,Instant.now().minusSeconds(3600))).isEqualTo(10);
        assertThat(reviews.begin(sme,m.id(),next.id()).run()).isTrue();
    }
    @Test void currentRoleStillMattersAfterAnAssignmentWasCreated(){
        var m=milestones.workspace(sme,project).milestones().getFirst();
        db.update("update app_users set role='ADMIN' where id=?",contributor);
        assertThatThrownBy(()->milestones.submit(contributor,m.id(),0,"Evidence",List.of(),List.of())).isInstanceOfSatisfying(MilestoneViolation.class,e->assertThat(e.code()).isEqualTo("ACCESS_DENIED"));
        db.update("update app_users set role='ADMIN',tax_code=null,company_website=null where id=?",sme);
        assertThatThrownBy(()->milestones.workspace(sme,project)).isInstanceOf(MilestoneViolation.class);
    }
    private UUID account(UserRole role){UUID id=UUID.randomUUID();db.update("insert into app_users(id,email,password_hash,display_name,role,account_state,tax_code) values(?,?,'hash','Milestone test',?,'ACTIVE',?)",id,id+"@example.com",role.name(),role==UserRole.SME?"0316789012":null);return id;}
    private Cookie access(UUID id,UserRole role){return new Cookie("genda_access",tokens.issueAccessToken(new AuthUser(id,id+"@example.com","hash","Milestone test",role,AccountState.ACTIVE,null),Instant.now(),Duration.ofMinutes(5)));}
}
