package vn.skillbridge.users.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import vn.skillbridge.users.domain.ContributorTier;
import vn.skillbridge.users.domain.ExperiencePolicy;
import vn.skillbridge.users.domain.ExperienceStanding;
import vn.skillbridge.users.domain.ProjectLevel;

/** Derived XP, tier and the policy needed to draw the experience bar without client-side constants. */
public record ExperienceResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int totalXp,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) ContributorTier tier,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int tierMinimumXp,
        @Schema(nullable = true, description = "Null at the top tier") ContributorTier nextTier,
        @Schema(nullable = true) Integer nextTierMinimumXp,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int xpToNextTier,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int basicXpCounted,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int basicXpCap,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<TierResponse> tiers,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<LevelResponse> levels,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, description = "Newest first") List<HistoryResponse> history) {

    public static ExperienceResponse from(ExperienceStanding standing) {
        ExperiencePolicy policy = standing.policy();
        var next = standing.nextTier();
        List<TierResponse> tiers = policy.tiers().stream()
                .map(tier -> new TierResponse(tier.tier(), tier.minimumXp(), sorted(tier.selfApplyLevels().stream()
                        .toList())))
                .toList();
        List<LevelResponse> levels = Arrays.stream(ProjectLevel.values())
                .map(level -> new LevelResponse(level, policy.xpPerLevel().get(level),
                        policy.lowestTierAllowing(level).tier(), standing.canSelfApply(level),
                        (int) standing.completedCount(level)))
                .toList();
        List<HistoryResponse> history = standing.history().reversed().stream()
                .map(award -> new HistoryResponse(award.record().projectTitle(), award.record().smeName(),
                        award.record().level(), award.record().completedAt(), award.xpAwarded(), award.capped()))
                .toList();
        return new ExperienceResponse(standing.totalXp(), standing.tier().tier(), standing.tier().minimumXp(),
                next == null ? null : next.tier(), next == null ? null : next.minimumXp(), standing.xpToNextTier(),
                standing.basicXpCounted(), policy.basicXpCap(), tiers, levels, history);
    }

    private static List<ProjectLevel> sorted(List<ProjectLevel> levels) {
        return levels.stream().sorted(Comparator.naturalOrder()).toList();
    }

    public record TierResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) ContributorTier tier,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int minimumXp,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<ProjectLevel> selfApplyLevels) {
    }

    public record LevelResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) ProjectLevel level,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int xpPerProject,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) ContributorTier requiredTier,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) boolean unlocked,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int completedProjects) {
    }

    public record HistoryResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String projectTitle,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String smeName,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) ProjectLevel level,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Instant completedAt,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int xpAwarded,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED,
                    description = "True when the BASIC XP cap reduced this project's XP") boolean capped) {
    }
}
