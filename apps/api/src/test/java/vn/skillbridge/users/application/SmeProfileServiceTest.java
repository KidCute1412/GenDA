package vn.skillbridge.users.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.skillbridge.auth.application.account.AccountProfile;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.auth.application.account.SmeIdentity;
import vn.skillbridge.users.domain.ContributorRuleViolation;
import vn.skillbridge.users.domain.SmeProfile;

class SmeProfileServiceTest {
    private final UUID userId = UUID.randomUUID();
    private final SmeProfileRepository profiles = mock(SmeProfileRepository.class);
    private final AccountProfileService accounts = mock(AccountProfileService.class);
    private final SmeProfileService service = new SmeProfileService(profiles, accounts);

    @BeforeEach
    void sme() {
        when(accounts.get(userId)).thenReturn(new AccountProfile(userId, "sme@example.com", "Registered SME", "SME"));
        when(accounts.isApprovedSme(userId)).thenReturn(true);
        when(accounts.smeIdentity(userId)).thenReturn(new SmeIdentity("0316789012", null));
        when(profiles.findByUserId(userId)).thenReturn(Optional.empty());
    }

    @Test
    void showsRegistrationDetailsWithoutCreatingAProfile() {
        var view = service.get(userId);
        assertThat(view.displayName()).isEqualTo("Registered SME");
        assertThat(view.taxCode()).isEqualTo("0316789012");
        assertThat(view.description()).isNull();
        verify(profiles, never()).save(any());
    }

    @Test
    void normalizesAndSavesOnlyTheCallersProfile() {
        var view = service.update(userId, "  My   SME  ", "  Company description  ", "  IT  ");
        verify(accounts).updateDisplayName(userId, "My SME");
        verify(profiles).save(new SmeProfile(userId, "Company description", "IT"));
        assertThat(view.displayName()).isEqualTo("My SME");
        assertThat(view.email()).isEqualTo("sme@example.com");
        when(profiles.findByUserId(userId)).thenReturn(Optional.of(new SmeProfile(userId, "Company description", "IT")));
        assertThat(service.get(userId).description()).isEqualTo("Company description");
    }

    @Test
    void blankOptionalTextIsClearedAndWebsiteIdentityIsSupported() {
        when(accounts.smeIdentity(userId)).thenReturn(new SmeIdentity(null, "https://example.com"));
        var view = service.update(userId, "SME", "  ", "");
        assertThat(view.description()).isNull();
        assertThat(view.industry()).isNull();
        assertThat(view.companyWebsite()).isEqualTo("https://example.com");
    }

    @Test
    void rejectsNonSmeAndDisabledAccountsBeforeReadingOrWritingProfileData() {
        when(accounts.isApprovedSme(userId)).thenReturn(false);
        for (String role : new String[] {"CONTRIBUTOR", "ADMIN", "SME"}) {
            when(accounts.get(userId)).thenReturn(new AccountProfile(userId, "user@example.com", "User", role));
            assertThatThrownBy(() -> service.get(userId)).isInstanceOf(UsersException.class);
            assertThatThrownBy(() -> service.update(userId, "SME", null, null)).isInstanceOf(UsersException.class);
        }
        verifyNoInteractions(profiles);
        verify(accounts, never()).updateDisplayName(any(), any());
        verify(accounts, never()).smeIdentity(any());
    }

    @Test
    void rejectsInvalidTextBeforeAnyWrite() {
        assertThatThrownBy(() -> service.update(userId, "  ", null, null)).isInstanceOf(ContributorRuleViolation.class);
        assertThatThrownBy(() -> service.update(userId, "x".repeat(181), null, null)).isInstanceOf(ContributorRuleViolation.class);
        assertThatThrownBy(() -> service.update(userId, "SME", "x".repeat(2001), null)).isInstanceOf(ContributorRuleViolation.class);
        assertThatThrownBy(() -> service.update(userId, "SME", null, "x".repeat(121))).isInstanceOf(ContributorRuleViolation.class);
        verifyNoInteractions(profiles);
        verify(accounts, never()).updateDisplayName(any(), any());
    }
}
