package vn.skillbridge.milestones.api.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import io.swagger.v3.oas.annotations.media.Schema;
import vn.skillbridge.milestones.domain.*;
import vn.skillbridge.milestones.application.MilestoneService;

public final class MilestoneResponses {
    private MilestoneResponses() {}
    public record CriterionResponse(@Schema(requiredMode=Schema.RequiredMode.REQUIRED) String id,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) String text) {}
    public record ExecutionMilestoneResponse(@Schema(requiredMode=Schema.RequiredMode.REQUIRED) UUID id,
        @Schema(requiredMode=Schema.RequiredMode.REQUIRED) int order,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) String title,
        @Schema(requiredMode=Schema.RequiredMode.REQUIRED) long budget,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) LocalDate deadline,
        @Schema(requiredMode=Schema.RequiredMode.REQUIRED) List<CriterionResponse> criteria,
        @Schema(requiredMode=Schema.RequiredMode.REQUIRED) Milestone.Status status,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) Milestone.Funding funding,
        @Schema(requiredMode=Schema.RequiredMode.REQUIRED) int revision) {
        public static ExecutionMilestoneResponse from(Milestone m){return new ExecutionMilestoneResponse(m.id(),m.order(),m.title(),m.budget(),m.deadline(),m.criteria().stream().map(c->new CriterionResponse(c.id(),c.text())).toList(),m.status(),m.funding(),m.revision());}
    }
    public record HandoffAttachmentResponse(@Schema(requiredMode=Schema.RequiredMode.REQUIRED) UUID id,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) String name,
        @Schema(requiredMode=Schema.RequiredMode.REQUIRED) String mediaType,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) long size) {
        public static HandoffAttachmentResponse from(Attachment a){return new HandoffAttachmentResponse(a.id(),a.name(),a.mediaType(),a.size());}
    }
    public record AiSourceResponse(@Schema(requiredMode=Schema.RequiredMode.REQUIRED) String id,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) String label,Integer page) {}
    public record AiQuoteResponse(@Schema(requiredMode=Schema.RequiredMode.REQUIRED) String source,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) String quote) {}
    public record AiCriterionResponse(@Schema(requiredMode=Schema.RequiredMode.REQUIRED) String criterionId,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) ReviewReport.EvidenceStatus status,
        @Schema(requiredMode=Schema.RequiredMode.REQUIRED) List<AiQuoteResponse> evidence,String question) {}
    public record AiReviewResponse(@Schema(requiredMode=Schema.RequiredMode.REQUIRED) UUID id,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) String state,
        @Schema(requiredMode=Schema.RequiredMode.REQUIRED) String model,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) Instant startedAt,Instant finishedAt,
        @Schema(requiredMode=Schema.RequiredMode.REQUIRED) List<AiCriterionResponse> items,String overallNote,
        @Schema(requiredMode=Schema.RequiredMode.REQUIRED) List<AiSourceResponse> sources,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) List<String> warnings,String errorCode) {
        public static AiReviewResponse from(AiReview r){return r==null?null:new AiReviewResponse(r.id(),r.state(),r.model(),r.startedAt(),r.finishedAt(),
            r.report()==null?List.of():r.report().items().stream().map(i->new AiCriterionResponse(i.criterionId(),i.status(),i.evidence().stream().map(q->new AiQuoteResponse(q.source(),q.quote())).toList(),i.question())).toList(),
            r.report()==null?null:r.report().overallNote(),r.sources().stream().map(s->new AiSourceResponse(s.id(),s.label(),s.page())).toList(),r.warnings(),r.errorCode());}
    }
    public record HandoffResponse(@Schema(requiredMode=Schema.RequiredMode.REQUIRED) UUID id,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) UUID milestoneId,
        @Schema(requiredMode=Schema.RequiredMode.REQUIRED) int revision,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) String note,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) List<String> links,
        @Schema(requiredMode=Schema.RequiredMode.REQUIRED) Instant submittedAt,String decision,String reason,Instant decidedAt,
        @Schema(requiredMode=Schema.RequiredMode.REQUIRED) List<HandoffAttachmentResponse> attachments,AiReviewResponse aiReview) {
        public static HandoffResponse from(MilestoneService.SubmissionView s){Handoff h=s.handoff();return new HandoffResponse(h.id(),h.milestoneId(),h.revision(),h.note(),h.links(),h.submittedAt(),h.decision(),h.reason(),h.decidedAt(),s.attachments().stream().map(HandoffAttachmentResponse::from).toList(),AiReviewResponse.from(s.review()));}
    }
    public record WorkspaceResponse(@Schema(requiredMode=Schema.RequiredMode.REQUIRED) String projectId,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) String title,
        @Schema(requiredMode=Schema.RequiredMode.REQUIRED) String smeName,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) String status,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) String viewerRole,
        @Schema(requiredMode=Schema.RequiredMode.REQUIRED) boolean aiAvailable,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) boolean storageAvailable,
        @Schema(requiredMode=Schema.RequiredMode.REQUIRED) List<ExecutionMilestoneResponse> milestones,@Schema(requiredMode=Schema.RequiredMode.REQUIRED) List<HandoffResponse> submissions) {
        public static WorkspaceResponse from(MilestoneService.Workspace w,boolean ai,boolean storage){return new WorkspaceResponse(w.project().id(),w.project().title(),w.project().smeName(),w.project().status(),w.viewerRole(),ai,storage,w.milestones().stream().map(ExecutionMilestoneResponse::from).toList(),w.submissions().stream().map(HandoffResponse::from).toList());}
    }
}
