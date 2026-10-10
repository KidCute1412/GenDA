package vn.skillbridge.milestones.application;

import java.time.Clock;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.milestones.domain.*;

@Service
public class AiReviewTransactions {
    public record Attempt(Milestone milestone, Handoff handoff, AiReview review, boolean run) {}
    private final MilestoneService milestones;
    private final MilestoneRepository repository;
    private final ReviewModelService model;
    private final Clock clock;
    public AiReviewTransactions(MilestoneService milestones, MilestoneRepository repository, ReviewModelService model, Clock clock) {
        this.milestones=milestones;this.repository=repository;this.model=model;this.clock=clock;
    }
    @Transactional
    public Attempt begin(UUID actor, UUID milestoneId, UUID revisionId) {
        Milestone m=milestones.access(actor,milestoneId,true);
        Handoff h=repository.handoff(revisionId).filter(x->x.milestoneId().equals(milestoneId)).orElseThrow(MilestoneService::missing);
        AiReview old=repository.review(h.id()).orElse(null);
        if(old!=null && "SUCCEEDED".equals(old.state())) return new Attempt(m,h,old,false);
        if(h.revision()!=m.revision()) throw MilestoneService.conflict();
        if(old!=null && "PROCESSING".equals(old.state())) {
            if(old.startedAt().isAfter(clock.instant().minusSeconds(120))) return new Attempt(m,h,old,false);
            repository.save(failed(old,"AI_TIMEOUT"));
            // Release the partial unique index before inserting a replacement attempt.
            repository.review(h.id());
        }
        if(!model.available()) throw new MilestoneViolation("AI_NOT_CONFIGURED","AI is not configured; regular review remains available");
        repository.lockReviewer(actor);
        if(repository.attempts(actor,clock.instant().minusSeconds(3600))>=10) throw new MilestoneViolation("AI_RATE_LIMIT","AI limit reached; try again later");
        var review=new AiReview(UUID.randomUUID(),h.id(),actor,"PROCESSING","gemini",model.model(),"milestone-v2",clock.instant(),null,null,List.of(),List.of(),null,null,null);
        repository.save(review);return new Attempt(m,h,review,true);
    }
    @Transactional
    public AiReview finish(AiReview pending, ReviewModelService.Result result, List<ReviewReport.Source> sources, List<String> warnings, String error) {
        Handoff handoff=repository.handoff(pending.handoffId()).orElseThrow(MilestoneService::missing);
        milestones.access(pending.requestedBy(),handoff.milestoneId(),true);
        AiReview current=repository.reviewById(pending.id()).orElseThrow(MilestoneService::missing);
        if(!"PROCESSING".equals(current.state())) return current;
        AiReview finalReview=new AiReview(current.id(),current.handoffId(),current.requestedBy(),error==null?"SUCCEEDED":"FAILED",
            current.provider(),current.model(),current.promptVersion(),current.startedAt(),clock.instant(),result==null?null:result.report(),
            sources,warnings,error,result==null?null:result.inputTokens(),result==null?null:result.outputTokens());
        repository.save(finalReview);return finalReview;
    }
    @Transactional
    public AiReview get(UUID actor, UUID milestoneId, UUID revisionId) {
        milestones.access(actor,milestoneId,true);
        repository.handoff(revisionId).filter(h->h.milestoneId().equals(milestoneId)).orElseThrow(MilestoneService::missing);
        AiReview review=repository.review(revisionId).orElse(null);
        if(review!=null && "PROCESSING".equals(review.state()) && review.startedAt().isBefore(clock.instant().minusSeconds(120))) {
            review=failed(review,"AI_TIMEOUT"); repository.save(review);
        }
        return review;
    }
    @Transactional
    public void feedback(UUID actor,UUID reviewId,boolean helpful) {
        AiReview review=repository.reviewById(reviewId).orElseThrow(MilestoneService::missing);
        Handoff handoff=repository.handoff(review.handoffId()).orElseThrow(MilestoneService::missing);
        milestones.access(actor,handoff.milestoneId(),false);
        if(!"SUCCEEDED".equals(review.state())) throw MilestoneService.conflict();
        repository.feedback(reviewId,actor,helpful,clock.instant());
    }
    private AiReview failed(AiReview r,String code) {return new AiReview(r.id(),r.handoffId(),r.requestedBy(),"FAILED",r.provider(),r.model(),r.promptVersion(),r.startedAt(),clock.instant(),null,r.sources(),r.warnings(),code,null,null);}
}
