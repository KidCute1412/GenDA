package vn.skillbridge.users.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import vn.skillbridge.auth.application.account.AccountProfile;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.users.domain.StudentProfile;
import vn.skillbridge.users.domain.StudyYear;

class StudentProfileServiceTest {
    private static final UUID USER_ID = UUID.fromString("40000000-0000-0000-0000-000000000001");
    private static final Instant NOW = Instant.parse("2026-10-07T00:00:00Z");
    private final StudentProfileRepository profiles = mock(StudentProfileRepository.class);
    private final SkillQueryService skills = mock(SkillQueryService.class);
    private final AccountProfileService accounts = mock(AccountProfileService.class);
    private final StudentProfileService service = new StudentProfileService(profiles, skills, accounts,
            Clock.fixed(NOW, ZoneOffset.UTC));

    @Test
    void returnsAnIncompleteViewWhenTheStudentHasNotCreatedAProfile() {
        when(accounts.get(USER_ID)).thenReturn(studentAccount());
        when(profiles.findByUserId(USER_ID)).thenReturn(Optional.empty());

        StudentProfileView result = service.get(USER_ID);

        assertThat(result.complete()).isFalse();
        assertThat(result.displayName()).isEqualTo("Lê Tuấn Lộc");
        assertThat(result.school()).isNull();
        assertThat(result.skills()).isEmpty();
    }

    @Test
    void updatesTheOwnedAccountNameAndStoresCanonicalSkills() {
        when(accounts.get(USER_ID)).thenReturn(studentAccount());
        when(profiles.findByUserId(USER_ID)).thenReturn(Optional.empty());
        Map<String, SkillSummary> canonical = new LinkedHashMap<>();
        canonical.put("react", new SkillSummary("react", "React"));
        canonical.put("typescript", new SkillSummary("typescript", "TypeScript"));
        when(skills.findByCodes(any())).thenReturn(canonical);

        StudentProfileView result = service.update(USER_ID, new UpdateStudentProfileCommand(
                "  Lê   Tuấn Lộc  ", "  ĐH Khoa học Tự nhiên  ", " Công nghệ Thông tin ", StudyYear.YEAR_3,
                List.of("React", "TYPESCRIPT")));

        verify(accounts).updateDisplayName(USER_ID, "Lê Tuấn Lộc");
        ArgumentCaptor<StudentProfile> profile = ArgumentCaptor.forClass(StudentProfile.class);
        verify(profiles).save(profile.capture());
        assertThat(profile.getValue().school()).isEqualTo("ĐH Khoa học Tự nhiên");
        assertThat(profile.getValue().skillCodes()).containsExactly("react", "typescript");
        assertThat(result.complete()).isTrue();
        assertThat(result.skills()).containsExactlyElementsOf(canonical.values());
    }

    @Test
    void rejectsSkillsOutsideTheCanonicalCatalog() {
        when(accounts.get(USER_ID)).thenReturn(studentAccount());
        when(skills.findByCodes(any())).thenReturn(Map.of());

        assertThatThrownBy(() -> service.update(USER_ID, new UpdateStudentProfileCommand(
                "Lê Tuấn Lộc", "HCMUS", "CNTT", StudyYear.YEAR_3, List.of("made-up"))))
                .isInstanceOf(UsersException.class)
                .extracting("code").isEqualTo("UNKNOWN_SKILL");
    }

    @Test
    void rejectsAProfileRequestFromANonStudentAccount() {
        when(accounts.get(USER_ID)).thenReturn(new AccountProfile(USER_ID, "sme@example.com", "SME", "SME"));

        assertThatThrownBy(() -> service.get(USER_ID))
                .isInstanceOf(UsersException.class)
                .extracting("code").isEqualTo("CONTRIBUTOR_ROLE_REQUIRED");
    }

    private AccountProfile studentAccount() {
        return new AccountProfile(USER_ID, "student@example.com", "Lê Tuấn Lộc", "CONTRIBUTOR");
    }
}
