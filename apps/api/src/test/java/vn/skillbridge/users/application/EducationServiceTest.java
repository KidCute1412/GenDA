package vn.skillbridge.users.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.skillbridge.auth.application.account.AccountProfile;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.users.domain.Education;
import vn.skillbridge.users.domain.EducationLevel;
import vn.skillbridge.users.domain.EducationStatus;

class EducationServiceTest {
    private static final UUID USER_ID = UUID.fromString("40000000-0000-0000-0000-000000000001");
    // 2026-09-30 20:00 UTC is already October in Vietnam, so an October start is not in the future.
    private static final Instant NOW = Instant.parse("2026-09-30T20:00:00Z");
    private final EducationRepository repository = mock(EducationRepository.class);
    private final AccountProfileService accounts = mock(AccountProfileService.class);
    private final EducationService service = new EducationService(repository, new ContributorAccounts(accounts),
            Clock.fixed(NOW, ZoneOffset.UTC));

    @Test
    void addsATrimmedEntryUsingVietnamTimeForTheCurrentMonth() {
        contributor();
        when(repository.countByUserId(USER_ID)).thenReturn(1);

        Education created = service.add(USER_ID, details(YearMonth.of(2026, 10), "  ĐH   Kinh tế  ", "  "));

        assertThat(created.institution()).isEqualTo("ĐH Kinh tế");
        assertThat(created.degreeName()).isNull();
        verify(repository).save(created);
    }

    @Test
    void capsTheNumberOfEntries() {
        contributor();
        when(repository.countByUserId(USER_ID)).thenReturn(Education.MAX_ENTRIES_PER_CONTRIBUTOR);

        assertThatThrownBy(() -> service.add(USER_ID, details(YearMonth.of(2024, 9), "ĐH", null)))
                .isInstanceOfSatisfying(UsersException.class,
                        exception -> assertThat(exception.code()).isEqualTo(UsersException.EDUCATION_LIMIT_REACHED));
        verify(repository, never()).save(any());
    }

    @Test
    void anotherContributorsEntryLooksMissing() {
        contributor();
        UUID foreign = UUID.randomUUID();
        when(repository.findOwned(USER_ID, foreign)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(USER_ID, foreign)).isInstanceOfSatisfying(UsersException.class,
                exception -> assertThat(exception.code()).isEqualTo(UsersException.EDUCATION_NOT_FOUND));
        verify(repository, never()).delete(any());
    }

    private static Education.Details details(YearMonth start, String institution, String degree) {
        return new Education.Details(institution, "Marketing", EducationLevel.BACHELOR, degree, start, null,
                EducationStatus.CURRENTLY_STUDYING, null);
    }

    private void contributor() {
        when(accounts.get(USER_ID)).thenReturn(new AccountProfile(USER_ID, "a@example.com", "A", "CONTRIBUTOR"));
    }
}
