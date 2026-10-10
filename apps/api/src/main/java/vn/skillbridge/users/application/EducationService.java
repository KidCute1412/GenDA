package vn.skillbridge.users.application;

import java.time.Clock;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.users.domain.Education;

/** Self-declared education history. Optional: it never affects profile completeness or readiness. */
@Service
public class EducationService {
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private final EducationRepository education;
    private final ContributorAccounts contributors;
    private final Clock clock;

    public EducationService(EducationRepository education, ContributorAccounts contributors, Clock clock) {
        this.education = education;
        this.contributors = contributors;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<Education> list(UUID userId) {
        contributors.require(userId);
        return education.findByUserId(userId);
    }

    @Transactional
    public Education add(UUID userId, Education.Details details) {
        contributors.require(userId);
        if (education.countByUserId(userId) >= Education.MAX_ENTRIES_PER_CONTRIBUTOR) {
            throw new UsersException(UsersException.EDUCATION_LIMIT_REACHED,
                    "A contributor can keep at most " + Education.MAX_ENTRIES_PER_CONTRIBUTOR + " education entries");
        }
        Education created = Education.create(UUID.randomUUID(), userId, normalize(details), currentMonth(),
                clock.instant());
        education.save(created);
        return created;
    }

    @Transactional
    public Education update(UUID userId, UUID educationId, Education.Details details) {
        contributors.require(userId);
        Education revised = owned(userId, educationId).revise(normalize(details), currentMonth(), clock.instant());
        education.save(revised);
        return revised;
    }

    @Transactional
    public void delete(UUID userId, UUID educationId) {
        contributors.require(userId);
        education.delete(owned(userId, educationId));
    }

    private Education owned(UUID userId, UUID educationId) {
        // Another contributor's entry is indistinguishable from a missing one.
        return education.findOwned(userId, educationId).orElseThrow(() ->
                new UsersException(UsersException.EDUCATION_NOT_FOUND, "Education entry was not found"));
    }

    private YearMonth currentMonth() {
        Instant now = clock.instant();
        return YearMonth.from(now.atZone(BUSINESS_ZONE));
    }

    private static Education.Details normalize(Education.Details details) {
        return new Education.Details(
                ContributorProfileService.normalize(details.institution()),
                ContributorProfileService.normalize(details.fieldOfStudy()),
                details.level(),
                blankToNull(ContributorProfileService.normalize(details.degreeName())),
                details.startMonth(),
                details.endMonth(),
                details.status(),
                blankToNull(details.description() == null ? null : details.description().trim()));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
