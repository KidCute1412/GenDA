package vn.skillbridge.milestones.api.dto;

import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;
import vn.skillbridge.milestones.domain.Milestone;

public final class MilestoneRequests {
    private MilestoneRequests() {}
    public record SubmitHandoffRequest(@NotNull @Min(0) Integer expectedRevision,@NotNull @Size(max=10000) String note,
        @NotNull @Size(max=5) List<@NotBlank @Size(max=2000) String> links,@NotNull @Size(max=5) List<@NotNull UUID> attachmentIds) {}
    public enum Decision { ACCEPTED, CHANGES_REQUESTED }
    public record HandoffDecisionRequest(@NotNull Decision decision,@Size(max=2000) String reason) {}
    public record MilestoneFundingRequest(@NotNull Milestone.Funding target,@Size(max=2000) String reason) {}
    public record AiFeedbackRequest(@NotNull Boolean helpful) {}
}
