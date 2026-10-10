package vn.skillbridge.milestones.infrastructure.persistence;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.core.type.TypeReference;
import vn.skillbridge.milestones.application.MilestoneRepository;
import vn.skillbridge.milestones.domain.*;
@Repository @Transactional
public class JpaMilestoneRepositoryAdapter implements MilestoneRepository {
 private final EntityManager em;
 private final JsonMapper json;
 public JpaMilestoneRepositoryAdapter(EntityManager em, JsonMapper json) { this.em=em; this.json=json; }
 public List<Milestone> milestones(String project) { return em.createQuery("from MilestoneJpaEntity where projectId=:p order by position",MilestoneJpaEntity.class).setParameter("p",project).getResultList().stream().map(this::milestone).toList(); }
 public Optional<Milestone> milestone(UUID id) { var e=em.find(MilestoneJpaEntity.class,id); if(e!=null)em.refresh(e); return Optional.ofNullable(e).map(this::milestone); }
 private Milestone milestone(MilestoneJpaEntity e) { return new Milestone(e.id,e.projectId,e.planId,e.position,e.title,e.budget,e.deadline,json.readValue(e.criteria,new TypeReference<List<Milestone.Criterion>>(){}),Milestone.Status.valueOf(e.status),Milestone.Funding.valueOf(e.funding),e.revision); }
 public void save(Milestone m) { var e=new MilestoneJpaEntity(); e.id=m.id();e.projectId=m.projectId();e.planId=m.planId();e.position=m.order();e.title=m.title();e.budget=m.budget();e.deadline=m.deadline();e.criteria=json.writeValueAsString(m.criteria());e.status=m.status().name();e.funding=m.funding().name();e.revision=m.revision();em.merge(e); }
 public List<Handoff> handoffs(UUID id) { return em.createQuery("from HandoffJpaEntity where milestoneId=:id order by revision",HandoffJpaEntity.class).setParameter("id",id).getResultList().stream().map(this::handoff).toList(); }
 public Optional<Handoff> handoff(UUID id) { return Optional.ofNullable(em.find(HandoffJpaEntity.class,id)).map(this::handoff); }
 private Handoff handoff(HandoffJpaEntity e) { return new Handoff(e.id,e.milestoneId,e.revision,e.actorId,e.note,json.readValue(e.links,new TypeReference<List<String>>(){}),e.submittedAt,e.decision,e.reason,e.decidedBy,e.decidedAt); }
 public void save(Handoff h) { var e=new HandoffJpaEntity();e.id=h.id();e.milestoneId=h.milestoneId();e.revision=h.revision();e.actorId=h.actorId();e.note=h.note();e.links=json.writeValueAsString(h.links());e.submittedAt=h.submittedAt();e.decision=h.decision();e.reason=h.reason();e.decidedBy=h.decidedBy();e.decidedAt=h.decidedAt();em.merge(e); }
 public Optional<Attachment> attachment(UUID id) { return Optional.ofNullable(em.find(AttachmentJpaEntity.class,id)).map(this::attachment); }
 public List<Attachment> attachments(UUID id) { return em.createQuery("from AttachmentJpaEntity where handoffId=:id order by uploadedAt",AttachmentJpaEntity.class).setParameter("id",id).getResultList().stream().map(this::attachment).toList(); }
 private Attachment attachment(AttachmentJpaEntity e) { return new Attachment(e.id,e.milestoneId,e.handoffId,e.ownerId,e.name,e.mediaType,e.size,e.objectKey,e.uploadedAt); }
 public void save(Attachment a) { var e=new AttachmentJpaEntity();e.id=a.id();e.milestoneId=a.milestoneId();e.handoffId=a.handoffId();e.ownerId=a.ownerId();e.name=a.name();e.mediaType=a.mediaType();e.size=a.size();e.objectKey=a.objectKey();e.uploadedAt=a.uploadedAt();em.merge(e); }
 public List<Attachment> expiredAttachments(Instant before) { return em.createQuery("from AttachmentJpaEntity where handoffId is null and uploadedAt<:before",AttachmentJpaEntity.class).setParameter("before",before).setMaxResults(100).getResultList().stream().map(this::attachment).toList(); }
 public void deleteAttachment(UUID id) { em.createQuery("delete from AttachmentJpaEntity where id=:id and handoffId is null").setParameter("id",id).executeUpdate(); }
 public Optional<AiReview> review(UUID id) { return em.createQuery("from AiReviewJpaEntity where handoffId=:id order by startedAt desc",AiReviewJpaEntity.class).setParameter("id",id).setMaxResults(1).getResultStream().findFirst().map(this::review); }
 public Optional<AiReview> reviewById(UUID id) { return Optional.ofNullable(em.find(AiReviewJpaEntity.class,id)).map(this::review); }
 private AiReview review(AiReviewJpaEntity e) { return new AiReview(e.id,e.handoffId,e.requestedBy,e.state,e.provider,e.model,e.promptVersion,e.startedAt,e.finishedAt,e.report==null?null:json.readValue(e.report,ReviewReport.class),json.readValue(e.sources,new TypeReference<List<ReviewReport.Source>>(){}),json.readValue(e.warnings,new TypeReference<List<String>>(){}),e.errorCode,e.inputTokens,e.outputTokens); }
 public void save(AiReview r) { var e=new AiReviewJpaEntity();e.id=r.id();e.handoffId=r.handoffId();e.requestedBy=r.requestedBy();e.state=r.state();e.provider=r.provider();e.model=r.model();e.promptVersion=r.promptVersion();e.startedAt=r.startedAt();e.finishedAt=r.finishedAt();e.report=r.report()==null?null:json.writeValueAsString(r.report());e.sources=json.writeValueAsString(r.sources());e.warnings=json.writeValueAsString(r.warnings());e.errorCode=r.errorCode();e.inputTokens=r.inputTokens();e.outputTokens=r.outputTokens();em.merge(e); }
 public long attempts(UUID actor,Instant since) { return em.createQuery("select count(r) from AiReviewJpaEntity r where requestedBy=:a and startedAt>=:t",Long.class).setParameter("a",actor).setParameter("t",since).getSingleResult(); }
 public void lockReviewer(UUID actor) { em.createNativeQuery("select 1 from pg_advisory_xact_lock(hashtext(:actor))").setParameter("actor","milestone-review:"+actor).getSingleResult(); }
 public void feedback(UUID review,UUID actor,boolean helpful,Instant now) { em.createNativeQuery("insert into milestone_ai_feedback(review_id,actor_id,helpful,updated_at) values(:r,:a,:h,:t) on conflict(review_id,actor_id) do update set helpful=excluded.helpful, updated_at=excluded.updated_at").setParameter("r",review).setParameter("a",actor).setParameter("h",helpful).setParameter("t",now).executeUpdate(); }
 public void audit(UUID milestone,UUID actor,String action,String reason,Instant now) { var e=new MilestoneEventJpaEntity();e.id=UUID.randomUUID();e.milestoneId=milestone;e.actorId=actor;e.action=action;e.reason=reason;e.occurredAt=now;em.persist(e); }
}
