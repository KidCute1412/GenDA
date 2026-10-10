package vn.skillbridge.projects.domain;

import java.util.EnumMap;
import java.util.Map;

/**
 * Server-owned budget policy (OQ-08, decided 2026-10-09). Every project budget stays inside the MVP range, and a
 * project leaving {@code DRAFT} must fall inside the inclusive range of its declared level. Adjacent ranges share
 * their boundary amount, so 1,500,000 is valid for both BASIC and MEDIUM.
 */
public final class ProjectBudgetPolicy {
    private final BudgetRange overall;
    private final Map<ProjectComplexity, BudgetRange> levels;

    public ProjectBudgetPolicy(BudgetRange overall, Map<ProjectComplexity, BudgetRange> levels) {
        EnumMap<ProjectComplexity, BudgetRange> copy = new EnumMap<>(ProjectComplexity.class);
        copy.putAll(levels);
        BudgetRange previous = null;
        for (ProjectComplexity complexity : ProjectComplexity.values()) {
            BudgetRange range = copy.get(complexity);
            if (range == null) {
                throw new IllegalArgumentException("Missing budget range for " + complexity);
            }
            if (range.minimum() < overall.minimum() || range.maximum() > overall.maximum()) {
                throw new IllegalArgumentException("Level budget range must stay inside the overall range");
            }
            if (previous != null && range.minimum() <= previous.minimum()) {
                throw new IllegalArgumentException("Level minimums must increase with complexity");
            }
            previous = range;
        }
        this.overall = overall;
        this.levels = copy;
    }

    public static ProjectBudgetPolicy standard() {
        return new ProjectBudgetPolicy(new BudgetRange(1_000_000, 5_000_000), Map.of(
                ProjectComplexity.BASIC, new BudgetRange(1_000_000, 1_500_000),
                ProjectComplexity.MEDIUM, new BudgetRange(1_500_000, 3_500_000),
                ProjectComplexity.HIGH, new BudgetRange(3_500_000, 5_000_000)));
    }

    public BudgetRange overall() {
        return overall;
    }

    public BudgetRange rangeFor(ProjectComplexity complexity) {
        return levels.get(complexity);
    }

    /** BR-10: holds for drafts as well as submitted projects. */
    public void requireWithinOverall(long budget) {
        if (!overall.contains(budget)) {
            throw new ProjectRuleViolation(ProjectRuleViolation.BUDGET_OUT_OF_RANGE,
                    "Project budget must be between " + overall.minimum() + " and " + overall.maximum() + " VND",
                    Map.of("minimumBudget", overall.minimum(), "maximumBudget", overall.maximum(),
                            "submittedBudget", budget));
        }
    }

    /** BR-18: checked when a project enters review and again when it is published. */
    public void requireWithinLevel(ProjectComplexity complexity, long budget) {
        BudgetRange range = rangeFor(complexity);
        if (!range.contains(budget)) {
            throw new ProjectRuleViolation(ProjectRuleViolation.BUDGET_OUTSIDE_LEVEL_RANGE,
                    "Project budget is outside the range of the selected level",
                    Map.of("complexity", complexity.name(), "minimumBudget", range.minimum(),
                            "maximumBudget", range.maximum(), "submittedBudget", budget));
        }
    }
}
