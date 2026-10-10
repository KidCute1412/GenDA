package vn.skillbridge.milestones.domain;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AiReview(UUID id, UUID handoffId, UUID requestedBy, String state, String provider, String model,
        String promptVersion, Instant startedAt, Instant finishedAt, ReviewReport report,
        List<ReviewReport.Source> sources, List<String> warnings, String errorCode, Long inputTokens, Long outputTokens) {}
