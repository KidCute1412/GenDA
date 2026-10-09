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
import vn.skillbridge.users.domain.BackgroundType;
import vn.skillbridge.users.domain.ContributorProfile;

class ContributorProfileServiceTest {
    private static final UUID USER_ID = UUID.fromString("40000000-0000-0000-0000-000000000001");
    private static final Instant NOW = Instant.parse("2026-10-09T00:00:00Z");
    private final ContributorProfileRepository profiles = mock(ContributorProfileRepository.class);
    private final SkillQueryService skills = mock(SkillQueryService.class);
    private final AccountProfileService accounts = mock(AccountProfileService.class);
    private final ContributorProfileService service = new ContributorProfileService(profiles, skills, accounts,
            new ContributorAccounts(accounts), Clock.fixed(NOW, ZoneOffset.UTC));

    @Test
    void anAbsentProfileIsIncomplete() {
        contributor();
        when(profiles.findByUserId(USER_ID)).thenReturn(Optional.empty());

        ContributorProfileView view = service.get(USER_ID);

        assertThat(view.complete()).isFalse();
        assertThat(view.backgroundType()).isNull();
        assertThat(view.displayName()).isEqualTo("Lê Tuấn Lộc");
    }

    @Test
    void storesTheContributorsOwnSkillOrderAndNormalizedText() {
        contributor();
        when(profiles.findByUserId(USER_ID)).thenReturn(Optional.empty());
        Map<String, SkillSummary> canonical = new LinkedHashMap<>();
        canonical.put("figma", new SkillSummary("figma", "Figma"));
        canonical.put("react", new SkillSummary("react", "React"));
        when(skills.findByCodes(any())).thenReturn(canonical);

        ContributorProfileView view = service.update(USER_ID, new UpdateContributorProfileCommand(
                "  Lê   Tuấn Lộc ", BackgroundType.STUDENT, "  Phát triển   web ", List.of("React", "FIGMA")));

        ArgumentCaptor<ContributorProfile> saved = ArgumentCaptor.forClass(ContributorProfile.class);
        verify(profiles).save(saved.capture());
        assertThat(saved.getValue().skillCodes()).containsExactly("react", "figma");
        assertThat(saved.getValue().specialization()).isEqualTo("Phát triển web");
        verify(accounts).updateDisplayName(USER_ID, "Lê Tuấn Lộc");
        assertThat(view.skills()).extracting(SkillSummary::code).containsExactly("react", "figma");
        assertThat(view.complete()).isTrue();
    }

    @Test
    void rejectsSkillsOutsideTheCatalogAndDuplicates() {
        contributor();
        when(skills.findByCodes(any())).thenReturn(Map.of("react", new SkillSummary("react", "React")));

        assertThatThrownBy(() -> service.update(USER_ID, command(List.of("react", "cobol"))))
                .isInstanceOfSatisfying(UsersException.class,
                        exception -> assertThat(exception.code()).isEqualTo(UsersException.UNKNOWN_SKILL));
        assertThatThrownBy(() -> service.update(USER_ID, command(List.of("react", "React"))))
                .isInstanceOfSatisfying(UsersException.class,
                        exception -> assertThat(exception.code()).isEqualTo(UsersException.DUPLICATE_SKILL));
    }

    private static UpdateContributorProfileCommand command(List<String> skills) {
        return new UpdateContributorProfileCommand("Lộc", BackgroundType.STUDENT, "Web", skills);
    }

    private void contributor() {
        when(accounts.get(USER_ID)).thenReturn(
                new AccountProfile(USER_ID, "loc@example.com", "Lê Tuấn Lộc", "CONTRIBUTOR"));
    }
}
