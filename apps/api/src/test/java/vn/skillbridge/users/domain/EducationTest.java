package vn.skillbridge.users.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.time.YearMonth;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class EducationTest {
    private static final YearMonth NOW = YearMonth.of(2026, 10);
    private static final Instant AT = Instant.parse("2026-10-09T00:00:00Z");

    @Test
    void currentStudiesMayCarryAnExpectedEndInTheFuture() {
        Education education = Education.create(UUID.randomUUID(), UUID.randomUUID(),
                details(YearMonth.of(2023, 9), YearMonth.of(2027, 6), EducationStatus.CURRENTLY_STUDYING), NOW, AT);

        assertThat(education.endMonth()).isEqualTo(YearMonth.of(2027, 6));
    }

    @Test
    void finishedEntriesNeedAPastEndMonth() {
        assertRejected(details(YearMonth.of(2020, 9), null, EducationStatus.GRADUATED));
        assertRejected(details(YearMonth.of(2020, 9), YearMonth.of(2027, 1), EducationStatus.NOT_COMPLETED));
    }

    @Test
    void notCompletedIsAHonestOptionForAFinishedPeriod() {
        Education education = Education.create(UUID.randomUUID(), UUID.randomUUID(),
                details(YearMonth.of(2020, 9), YearMonth.of(2022, 1), EducationStatus.NOT_COMPLETED), NOW, AT);

        assertThat(education.status()).isEqualTo(EducationStatus.NOT_COMPLETED);
    }

    @Test
    void rejectsMissingFutureOrInvertedPeriods() {
        assertRejected(details(null, null, EducationStatus.CURRENTLY_STUDYING));
        assertRejected(details(YearMonth.of(2026, 11), null, EducationStatus.CURRENTLY_STUDYING));
        assertRejected(details(YearMonth.of(2024, 9), YearMonth.of(2024, 1), EducationStatus.COMPLETED));
    }

    @Test
    void revisingKeepsIdentityAndCreationTime() {
        Education original = Education.create(UUID.randomUUID(), UUID.randomUUID(),
                details(YearMonth.of(2023, 9), null, EducationStatus.CURRENTLY_STUDYING), NOW, AT);

        Education revised = original.revise(details(YearMonth.of(2023, 9), YearMonth.of(2026, 6),
                EducationStatus.GRADUATED), NOW, AT.plusSeconds(60));

        assertThat(revised.id()).isEqualTo(original.id());
        assertThat(revised.createdAt()).isEqualTo(AT);
        assertThat(revised.updatedAt()).isEqualTo(AT.plusSeconds(60));
    }

    private static void assertRejected(Education.Details details) {
        assertThatThrownBy(() -> Education.create(UUID.randomUUID(), UUID.randomUUID(), details, NOW, AT))
                .isInstanceOfSatisfying(ContributorRuleViolation.class, violation ->
                        assertThat(violation.code()).isEqualTo(ContributorRuleViolation.EDUCATION_INVALID_PERIOD));
    }

    private static Education.Details details(YearMonth start, YearMonth end, EducationStatus status) {
        return new Education.Details("ĐH Khoa học Tự nhiên", "Công nghệ Thông tin", EducationLevel.BACHELOR, null,
                start, end, status, null);
    }
}
