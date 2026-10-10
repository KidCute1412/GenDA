package vn.skillbridge.users.application;

import java.time.Clock;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.auth.application.account.AccountProfile;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.users.domain.ContributorProfile;

@Service
public class ContributorProfileService {
    private final ContributorProfileRepository profiles;
    private final SkillQueryService skills;
    private final AccountProfileService accounts;
    private final ContributorAccounts contributors;
    private final Clock clock;

    public ContributorProfileService(ContributorProfileRepository profiles, SkillQueryService skills,
            AccountProfileService accounts, ContributorAccounts contributors, Clock clock) {
        this.profiles = profiles;
        this.skills = skills;
        this.accounts = accounts;
        this.contributors = contributors;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public ContributorProfileView get(UUID userId) {
        AccountProfile account = contributors.require(userId);
        return profiles.findByUserId(userId)
                .map(profile -> toView(account, profile))
                .orElseGet(() -> new ContributorProfileView(account.id(), account.email(), account.displayName(),
                        null, null, List.of(), false));
    }

    /** Whether the readiness checklist counts the profile as complete; also used by eligibility. */
    @Transactional(readOnly = true)
    public boolean isComplete(UUID userId) {
        return profiles.findByUserId(userId).map(ContributorProfile::isComplete).orElse(false);
    }

    @Transactional
    public ContributorProfileView update(UUID userId, UpdateContributorProfileCommand command) {
        AccountProfile account = contributors.require(userId);
        List<String> requestedCodes = normalizeSkillCodes(command.skillCodes());
        Map<String, SkillSummary> canonicalSkills = skills.findByCodes(requestedCodes);
        if (canonicalSkills.size() != requestedCodes.size()) {
            throw new UsersException(UsersException.UNKNOWN_SKILL, "One or more skills are not in the canonical catalog");
        }

        Instant now = clock.instant();
        Instant createdAt = profiles.findByUserId(userId).map(ContributorProfile::createdAt).orElse(now);
        // Keep the contributor's own order: the first skills are the ones they lead with.
        var profile = new ContributorProfile(userId, command.backgroundType(), normalize(command.specialization()),
                requestedCodes, createdAt, now);
        String displayName = normalize(command.displayName());
        accounts.updateDisplayName(userId, displayName);
        profiles.save(profile);
        AccountProfile updatedAccount = new AccountProfile(account.id(), account.email(), displayName,
                account.role());
        return toView(updatedAccount, profile);
    }

    private ContributorProfileView toView(AccountProfile account, ContributorProfile profile) {
        Map<String, SkillSummary> byCode = skills.findByCodes(profile.skillCodes());
        List<SkillSummary> selected = profile.skillCodes().stream().map(byCode::get)
                .filter(Objects::nonNull).toList();
        return new ContributorProfileView(account.id(), account.email(), account.displayName(),
                profile.backgroundType(), profile.specialization(), selected, profile.isComplete());
    }

    private static List<String> normalizeSkillCodes(List<String> skillCodes) {
        List<String> normalized = skillCodes.stream()
                .map(code -> code.trim().toLowerCase(Locale.ROOT))
                .toList();
        if (new LinkedHashSet<>(normalized).size() != normalized.size()) {
            throw new UsersException(UsersException.DUPLICATE_SKILL, "A skill can only be selected once");
        }
        return normalized;
    }

    static String normalize(String value) {
        return value == null ? null : value.trim().replaceAll("\\s+", " ");
    }
}
