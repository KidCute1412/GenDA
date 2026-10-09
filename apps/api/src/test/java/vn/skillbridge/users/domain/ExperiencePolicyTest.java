package vn.skillbridge.users.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class ExperiencePolicyTest {
    private final ExperiencePolicy policy = ExperiencePolicy.standard();
    private int day;

    @Test
    void aNewContributorIsBronzeAndMayOnlyApplyToBasic() {
        ExperienceStanding standing = policy.evaluate(List.of());

        assertThat(standing.totalXp()).isZero();
        assertThat(standing.tier().tier()).isEqualTo(ContributorTier.BRONZE);
        assertThat(standing.nextTier().tier()).isEqualTo(ContributorTier.SILVER);
        assertThat(standing.xpToNextTier()).isEqualTo(10);
        assertThat(standing.canSelfApply(ProjectLevel.BASIC)).isTrue();
        assertThat(standing.canSelfApply(ProjectLevel.MEDIUM)).isFalse();
        assertThat(standing.canSelfApply(ProjectLevel.HIGH)).isFalse();
    }

    @Test
    void tenBasicProjectsReachSilver() {
        assertThat(policy.evaluate(records(ProjectLevel.BASIC, 9)).tier().tier()).isEqualTo(ContributorTier.BRONZE);

        ExperienceStanding silver = policy.evaluate(records(ProjectLevel.BASIC, 10));

        assertThat(silver.totalXp()).isEqualTo(10);
        assertThat(silver.tier().tier()).isEqualTo(ContributorTier.SILVER);
        assertThat(silver.canSelfApply(ProjectLevel.MEDIUM)).isTrue();
        assertThat(silver.canSelfApply(ProjectLevel.HIGH)).isFalse();
        assertThat(silver.xpToNextTier()).isEqualTo(20);
    }

    @Test
    void basicXpStopsCountingAtTheCapSoGoldNeedsMediumWork() {
        ExperienceStanding standing = policy.evaluate(records(ProjectLevel.BASIC, 25));

        assertThat(standing.totalXp()).isEqualTo(10);
        assertThat(standing.basicCapReached()).isTrue();
        assertThat(standing.tier().tier()).isEqualTo(ContributorTier.SILVER);
        assertThat(standing.history()).hasSize(25);
        assertThat(standing.history().get(9).capped()).isFalse();
        assertThat(standing.history().get(10).xpAwarded()).isZero();
        assertThat(standing.history().get(10).capped()).isTrue();
    }

    @Test
    void theCapIsSpentByTheOldestBasicCompletions() {
        List<ExperienceRecord> history = new ArrayList<>(records(ProjectLevel.BASIC, 11));
        history.addFirst(history.removeLast());

        ExperienceStanding standing = policy.evaluate(history);

        assertThat(standing.history().getLast().capped()).isTrue();
        assertThat(standing.history().getFirst().capped()).isFalse();
    }

    @Test
    void goldStartsAtThirtyXpAndUnlocksHigh() {
        List<ExperienceRecord> history = new ArrayList<>(records(ProjectLevel.BASIC, 10));
        history.addAll(records(ProjectLevel.MEDIUM, 9));
        ExperienceStanding almost = policy.evaluate(history);
        assertThat(almost.totalXp()).isEqualTo(28);
        assertThat(almost.canSelfApply(ProjectLevel.HIGH)).isFalse();

        history.addAll(records(ProjectLevel.MEDIUM, 1));
        ExperienceStanding gold = policy.evaluate(history);

        assertThat(gold.totalXp()).isEqualTo(30);
        assertThat(gold.tier().tier()).isEqualTo(ContributorTier.GOLD);
        assertThat(gold.nextTier()).isNull();
        assertThat(gold.xpToNextTier()).isZero();
        assertThat(gold.canSelfApply(ProjectLevel.HIGH)).isTrue();
        assertThat(gold.completedCount(ProjectLevel.MEDIUM)).isEqualTo(10);
    }

    @Test
    void mediumAndHighAlwaysAwardTheirFullWeight() {
        List<ExperienceRecord> history = new ArrayList<>(records(ProjectLevel.MEDIUM, 2));
        history.addAll(records(ProjectLevel.HIGH, 1));

        assertThat(policy.evaluate(history).totalXp()).isEqualTo(7);
    }

    @Test
    void reportsTheLowestTierAllowingEachLevel() {
        assertThat(policy.lowestTierAllowing(ProjectLevel.BASIC).tier()).isEqualTo(ContributorTier.BRONZE);
        assertThat(policy.lowestTierAllowing(ProjectLevel.MEDIUM).tier()).isEqualTo(ContributorTier.SILVER);
        assertThat(policy.lowestTierAllowing(ProjectLevel.HIGH).tier()).isEqualTo(ContributorTier.GOLD);
    }

    private List<ExperienceRecord> records(ProjectLevel level, int count) {
        List<ExperienceRecord> records = new ArrayList<>();
        for (int index = 0; index < count; index++) {
            day++;
            records.add(new ExperienceRecord(UUID.randomUUID(), level + " " + day, "SME",
                    level, Instant.parse("2026-01-01T00:00:00Z").plusSeconds(day * 86_400L)));
        }
        return records;
    }
}
