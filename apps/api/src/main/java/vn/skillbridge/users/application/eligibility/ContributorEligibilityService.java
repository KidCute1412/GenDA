package vn.skillbridge.users.application.eligibility;

import java.time.YearMonth;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.auth.application.account.AccountProfile;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.auth.application.account.AccountStanding;
import vn.skillbridge.users.application.ApplicationReadiness;
import vn.skillbridge.users.application.ContributorProfileRepository;
import vn.skillbridge.users.application.CvFile;
import vn.skillbridge.users.application.CvRepository;
import vn.skillbridge.users.application.EducationRepository;
import vn.skillbridge.users.application.ExperienceRecordRepository;
import vn.skillbridge.users.application.SkillQueryService;
import vn.skillbridge.users.application.SkillSummary;
import vn.skillbridge.users.domain.ContributorCv;
import vn.skillbridge.users.domain.ContributorProfile;
import vn.skillbridge.users.domain.ExperiencePolicy;
import vn.skillbridge.users.domain.ExperienceStanding;
import vn.skillbridge.users.domain.ProjectLevel;

/**
 * Public facade of {@code users} for the applications module (architecture: applications checks eligibility
 * through users, never through its persistence). Callers authorize the request; this facade only derives facts.
 */
@Service
public class ContributorEligibilityService {
    private final AccountProfileService accounts;
    private final ContributorProfileRepository profiles;
    private final EducationRepository education;
    private final CvRepository cvs;
    private final ExperienceRecordRepository experience;
    private final ExperiencePolicy policy;
    private final SkillQueryService skills;

    public ContributorEligibilityService(AccountProfileService accounts, ContributorProfileRepository profiles,
            EducationRepository education, CvRepository cvs, ExperienceRecordRepository experience,
            ExperiencePolicy policy, SkillQueryService skills) {
        this.accounts = accounts;
        this.profiles = profiles;
        this.education = education;
        this.cvs = cvs;
        this.experience = experience;
        this.policy = policy;
        this.skills = skills;
    }

    /** Evaluated at request time from current account, profile, CV and completion history; never stored. */
    @Transactional(readOnly = true)
    public ApplicationEligibility evaluate(UUID contributorId, String projectLevel) {
        ProjectLevel level = ProjectLevel.valueOf(projectLevel);
        AccountStanding account = accounts.standing(contributorId);
        boolean profileComplete = profiles.findByUserId(contributorId).map(ContributorProfile::isComplete).orElse(false);
        boolean cvReady = cvs.findByUserId(contributorId).map(ContributorCv::isReady).orElse(false);
        ExperienceStanding standing = policy.evaluate(experience.findByContributorId(contributorId));
        ExperiencePolicy.TierRule required = policy.lowestTierAllowing(level);
        return new ApplicationEligibility(
                new ApplicationReadiness(account.active(), profileComplete, cvReady),
                standing.tier().tier().name(), standing.totalXp(), required.tier().name(), required.minimumXp(),
                standing.canSelfApply(level));
    }

    /** Applicant profiles in the order of {@code contributorIds}. */
    @Transactional(readOnly = true)
    public List<ApplicantProfile> applicants(Collection<UUID> contributorIds) {
        return contributorIds.stream().distinct().map(this::applicant).toList();
    }

    /** The applicant's current CV file, for a caller that has already authorized the reviewer. */
    @Transactional(readOnly = true)
    public Optional<CvFile> cvOf(UUID contributorId) {
        return cvs.findByUserId(contributorId).flatMap(cv -> cvs.findContent(contributorId)
                .map(content -> new CvFile(cv.fileName(), content)));
    }

    private ApplicantProfile applicant(UUID contributorId) {
        AccountProfile account = accounts.get(contributorId);
        Optional<ContributorProfile> profile = profiles.findByUserId(contributorId);
        List<String> codes = profile.map(ContributorProfile::skillCodes).orElse(List.of());
        Map<String, SkillSummary> byCode = skills.findByCodes(codes);
        ExperienceStanding standing = policy.evaluate(experience.findByContributorId(contributorId));
        Map<String, Integer> completed = Arrays.stream(ProjectLevel.values()).collect(Collectors.toMap(
                Enum::name, level -> (int) standing.completedCount(level)));
        List<ApplicantProfile.Education> entries = education.findByUserId(contributorId).stream()
                .map(entry -> new ApplicantProfile.Education(entry.institution(), entry.fieldOfStudy(),
                        entry.level().name(), entry.degreeName(), month(entry.startMonth()), month(entry.endMonth()),
                        entry.status().name()))
                .toList();
        ApplicantProfile.Cv cv = cvs.findByUserId(contributorId).filter(ContributorCv::isReady)
                .map(current -> new ApplicantProfile.Cv(current.fileName(), current.sizeBytes(), current.pageCount(),
                        current.uploadedAt()))
                .orElse(null);
        return new ApplicantProfile(contributorId, account.displayName(), account.email(),
                profile.map(value -> value.backgroundType().name()).orElse(null),
                profile.map(ContributorProfile::specialization).orElse(null),
                codes.stream().map(byCode::get).filter(Objects::nonNull).toList(), entries,
                standing.tier().tier().name(), standing.totalXp(), completed, cv);
    }

    private static String month(YearMonth value) {
        return value == null ? null : value.toString();
    }
}
