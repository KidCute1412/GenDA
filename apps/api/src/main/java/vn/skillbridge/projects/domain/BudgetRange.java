package vn.skillbridge.projects.domain;

/** Inclusive VND budget range. */
public record BudgetRange(long minimum, long maximum) {
    public BudgetRange {
        if (minimum <= 0 || maximum < minimum) {
            throw new IllegalArgumentException("Budget range must be positive and ordered");
        }
    }

    public boolean contains(long amount) {
        return amount >= minimum && amount <= maximum;
    }
}
