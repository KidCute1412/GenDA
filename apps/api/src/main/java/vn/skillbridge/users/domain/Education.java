package vn.skillbridge.users.domain;

import java.time.Instant;
import java.time.YearMonth;
import java.util.UUID;

/**
 * One self-declared education entry. Periods have month precision. Entries migrated from the legacy
 * single-school profile may not know their period yet, so {@code startMonth} is optional when read but
 * required whenever the contributor writes an entry.
 */
public record Education(
        UUID id,
        UUID userId,
        String institution,
        String fieldOfStudy,
        EducationLevel level,
        String degreeName,
        YearMonth startMonth,
        YearMonth endMonth,
        EducationStatus status,
        String description,
        Instant createdAt,
        Instant updatedAt) {

    public static final int MAX_ENTRIES_PER_CONTRIBUTOR = 10;

    public static Education create(UUID id, UUID userId, Details details, YearMonth currentMonth, Instant now) {
        details.validate(currentMonth);
        return new Education(id, userId, details.institution(), details.fieldOfStudy(), details.level(),
                details.degreeName(), details.startMonth(), details.endMonth(), details.status(),
                details.description(), now, now);
    }

    public Education revise(Details details, YearMonth currentMonth, Instant now) {
        details.validate(currentMonth);
        return new Education(id, userId, details.institution(), details.fieldOfStudy(), details.level(),
                details.degreeName(), details.startMonth(), details.endMonth(), details.status(),
                details.description(), createdAt, now);
    }

    /** The editable part of an entry, already trimmed by the caller. */
    public record Details(
            String institution,
            String fieldOfStudy,
            EducationLevel level,
            String degreeName,
            YearMonth startMonth,
            YearMonth endMonth,
            EducationStatus status,
            String description) {

        void validate(YearMonth currentMonth) {
            if (startMonth == null) {
                throw period("Start month is required");
            }
            if (startMonth.isAfter(currentMonth)) {
                throw period("Start month cannot be in the future");
            }
            if (endMonth != null && endMonth.isBefore(startMonth)) {
                throw period("End month cannot be before the start month");
            }
            if (status.isFinished()) {
                if (endMonth == null) {
                    throw period("A finished education entry needs an end month");
                }
                if (endMonth.isAfter(currentMonth)) {
                    throw period("A finished education entry cannot end in the future");
                }
            }
        }

        private static ContributorRuleViolation period(String message) {
            return new ContributorRuleViolation(ContributorRuleViolation.EDUCATION_INVALID_PERIOD, message);
        }
    }
}
