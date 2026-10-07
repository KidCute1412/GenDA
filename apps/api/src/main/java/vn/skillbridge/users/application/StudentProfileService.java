package vn.skillbridge.users.application;

import java.time.Clock;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.auth.application.account.AccountProfile;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.users.domain.StudentProfile;

@Service
public class StudentProfileService {
    private final StudentProfileRepository profiles;
    private final SkillQueryService skills;
    private final AccountProfileService accounts;
    private final Clock clock;

    public StudentProfileService(StudentProfileRepository profiles, SkillQueryService skills,
            AccountProfileService accounts, Clock clock) {
        this.profiles = profiles;
        this.skills = skills;
        this.accounts = accounts;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public StudentProfileView get(UUID userId) {
        AccountProfile account = requireStudent(userId);
        return profiles.findByUserId(userId)
                .map(profile -> toView(account, profile))
                .orElseGet(() -> new StudentProfileView(account.id(), account.email(), account.displayName(),
                        null, null, null, List.of(), false));
    }

    @Transactional
    public StudentProfileView update(UUID userId, UpdateStudentProfileCommand command) {
        AccountProfile account = requireStudent(userId);
        List<String> requestedCodes = normalizeSkillCodes(command.skillCodes());
        var canonicalSkills = skills.findByCodes(requestedCodes);
        if (canonicalSkills.size() != requestedCodes.size()) {
            throw new UsersException("UNKNOWN_SKILL", "One or more skills are not in the canonical catalog");
        }

        Instant now = clock.instant();
        Instant createdAt = profiles.findByUserId(userId).map(StudentProfile::createdAt).orElse(now);
        List<String> canonicalCodes = canonicalSkills.keySet().stream().toList();
        var profile = new StudentProfile(userId, normalize(command.school()), normalize(command.major()),
                command.studyYear(), canonicalCodes, createdAt, now);
        String displayName = normalize(command.displayName());
        accounts.updateDisplayName(userId, displayName);
        profiles.save(profile);
        AccountProfile updatedAccount = new AccountProfile(account.id(), account.email(), displayName,
                account.role());
        return toView(updatedAccount, profile);
    }

    private AccountProfile requireStudent(UUID userId) {
        AccountProfile account = accounts.get(userId);
        if (!"CONTRIBUTOR".equals(account.role())) {
            throw new UsersException("CONTRIBUTOR_ROLE_REQUIRED", "A contributor account is required");
        }
        return account;
    }

    private StudentProfileView toView(AccountProfile account, StudentProfile profile) {
        List<SkillSummary> selectedSkills = skills.findByCodes(profile.skillCodes()).values().stream().toList();
        return new StudentProfileView(account.id(), account.email(), account.displayName(), profile.school(),
                profile.major(), profile.studyYear(), selectedSkills, true);
    }

    private static List<String> normalizeSkillCodes(List<String> skillCodes) {
        List<String> normalized = skillCodes.stream()
                .map(code -> code.trim().toLowerCase(Locale.ROOT))
                .toList();
        if (new LinkedHashSet<>(normalized).size() != normalized.size()) {
            throw new UsersException("DUPLICATE_SKILL", "A skill can only be selected once");
        }
        return normalized;
    }

    private static String normalize(String value) {
        return value.trim().replaceAll("\\s+", " ");
    }
}
