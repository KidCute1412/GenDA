package vn.skillbridge.users.domain;

import java.util.List;

/** A contributor's derived XP, tier and progress towards the next tier. */
public record ExperienceStanding(
        ExperiencePolicy policy,
        int totalXp,
        int basicXpCounted,
        ExperiencePolicy.TierRule tier,
        ExperiencePolicy.TierRule nextTier,
        List<Award> history) {

    public ExperienceStanding {
        history = List.copyOf(history);
    }

    /** XP still missing for the next tier, or 0 at the top tier. */
    public int xpToNextTier() {
        return nextTier == null ? 0 : nextTier.minimumXp() - totalXp;
    }

    public boolean basicCapReached() {
        return basicXpCounted >= policy.basicXpCap();
    }

    public boolean canSelfApply(ProjectLevel level) {
        return tier.selfApplyLevels().contains(level);
    }

    public long completedCount(ProjectLevel level) {
        return history.stream().filter(award -> award.record().level() == level).count();
    }

    /** XP the history entry contributed; {@code capped} when the BASIC cap reduced it. */
    public record Award(ExperienceRecord record, int xpAwarded, boolean capped) {
    }
}
