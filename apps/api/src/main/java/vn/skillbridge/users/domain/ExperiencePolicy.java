package vn.skillbridge.users.domain;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * How completed projects become XP and how XP becomes a tier (FR-APP-08, BR-20, BR-21).
 *
 * <p>XP earned from {@code BASIC} projects counts up to {@link #basicXpCap()}. With the standard policy that cap
 * equals the SILVER threshold, so the XP between SILVER and GOLD must come from {@code MEDIUM} work.
 */
public record ExperiencePolicy(Map<ProjectLevel, Integer> xpPerLevel, int basicXpCap, List<TierRule> tiers) {

    public ExperiencePolicy {
        xpPerLevel = Map.copyOf(new EnumMap<>(xpPerLevel));
        tiers = tiers.stream().sorted(Comparator.comparingInt(TierRule::minimumXp)).toList();
        if (tiers.isEmpty() || tiers.getFirst().minimumXp() != 0) {
            throw new IllegalArgumentException("The lowest tier must start at 0 XP");
        }
        for (ProjectLevel level : ProjectLevel.values()) {
            if (!xpPerLevel.containsKey(level)) {
                throw new IllegalArgumentException("Missing XP weight for " + level);
            }
        }
    }

    public static ExperiencePolicy standard() {
        return new ExperiencePolicy(
                Map.of(ProjectLevel.BASIC, 1, ProjectLevel.MEDIUM, 2, ProjectLevel.HIGH, 3),
                10,
                List.of(
                        new TierRule(ContributorTier.BRONZE, 0, EnumSet.of(ProjectLevel.BASIC)),
                        new TierRule(ContributorTier.SILVER, 10, EnumSet.of(ProjectLevel.BASIC, ProjectLevel.MEDIUM)),
                        new TierRule(ContributorTier.GOLD, 30, EnumSet.allOf(ProjectLevel.class))));
    }

    /** Awards XP oldest-first so the BASIC cap is spent by the earliest BASIC completions. */
    public ExperienceStanding evaluate(List<ExperienceRecord> records) {
        List<ExperienceRecord> ordered = records.stream()
                .sorted(Comparator.comparing(ExperienceRecord::completedAt)).toList();
        List<ExperienceStanding.Award> awards = new ArrayList<>(ordered.size());
        int total = 0;
        int basicCounted = 0;
        for (ExperienceRecord record : ordered) {
            int weight = xpPerLevel.get(record.level());
            int awarded = weight;
            if (record.level() == ProjectLevel.BASIC) {
                awarded = Math.max(0, Math.min(weight, basicXpCap - basicCounted));
                basicCounted += awarded;
            }
            total += awarded;
            awards.add(new ExperienceStanding.Award(record, awarded, awarded < weight));
        }
        return new ExperienceStanding(this, total, basicCounted, tierFor(total), nextTierAfter(total), awards);
    }

    public TierRule tierFor(int xp) {
        TierRule current = tiers.getFirst();
        for (TierRule tier : tiers) {
            if (xp >= tier.minimumXp()) {
                current = tier;
            }
        }
        return current;
    }

    /** The lowest tier whose members may apply to {@code level} on their own. */
    public TierRule lowestTierAllowing(ProjectLevel level) {
        return tiers.stream().filter(tier -> tier.selfApplyLevels().contains(level)).findFirst()
                .orElseThrow(() -> new IllegalStateException("No tier allows " + level));
    }

    private TierRule nextTierAfter(int xp) {
        return tiers.stream().filter(tier -> tier.minimumXp() > xp).findFirst().orElse(null);
    }

    public record TierRule(ContributorTier tier, int minimumXp, Set<ProjectLevel> selfApplyLevels) {
        public TierRule {
            selfApplyLevels = Set.copyOf(selfApplyLevels);
        }
    }
}
