package vn.skillbridge.milestones.application;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.skillbridge.milestones.domain.*;

public interface MilestoneRepository {
    List<Milestone> milestones(String projectId);
    Optional<Milestone> milestone(UUID id);
    void save(Milestone milestone);
    List<Handoff> handoffs(UUID milestoneId);
    Optional<Handoff> handoff(UUID id);
    void save(Handoff handoff);
    Optional<Attachment> attachment(UUID id);
    List<Attachment> attachments(UUID handoffId);
    void save(Attachment attachment);
    List<Attachment> expiredAttachments(Instant before);
    void deleteAttachment(UUID id);
    Optional<AiReview> review(UUID handoffId);
    Optional<AiReview> reviewById(UUID id);
    void save(AiReview review);
    long attempts(UUID actor, Instant since);
    void lockReviewer(UUID actor);
    void feedback(UUID review, UUID actor, boolean helpful, Instant now);
    void audit(UUID milestone, UUID actor, String action, String reason, Instant now);
}
