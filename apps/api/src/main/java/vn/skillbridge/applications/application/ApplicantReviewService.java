package vn.skillbridge.applications.application;

import java.time.Clock;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.applications.domain.Application;
import vn.skillbridge.applications.domain.ApplicationStatus;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.matching.domain.SkillMatch;
import vn.skillbridge.projects.application.staffing.ProjectStaffingService;
import vn.skillbridge.projects.application.staffing.StaffingProject;
import vn.skillbridge.users.application.CvFile;
import vn.skillbridge.users.application.SkillQueryService;
import vn.skillbridge.users.application.SkillSummary;
import vn.skillbridge.users.application.eligibility.ApplicantProfile;
import vn.skillbridge.users.application.eligibility.ContributorEligibilityService;

/**
 * The owning SME's side: review applicants ranked by skill match, shortlist, and accept exactly one (FR-APP-03..05,
 * FR-MAT-03). An SME only ever reaches applications of projects it owns.
 */
@Service
public class ApplicantReviewService {
    private final ApplicationRepository applications;
    private final ProjectStaffingService projects;
    private final ContributorEligibilityService contributors;
    private final SkillQueryService skills;
    private final AccountProfileService accounts;
    private final Clock clock;

    public ApplicantReviewService(ApplicationRepository applications, ProjectStaffingService projects,
            ContributorEligibilityService contributors, SkillQueryService skills, AccountProfileService accounts,
            Clock clock) {
        this.applications = applications;
        this.projects = projects;
        this.contributors = contributors;
        this.skills = skills;
        this.accounts = accounts;
        this.clock = clock;
    }

    /** Best skill match first, then the earliest applicant; withdrawn applications are left out. */
    @Transactional(readOnly = true)
    public ProjectApplicantsView applicants(UUID smeId, String projectId) {
        requireSme(smeId);
        StaffingProject project = projects.ownedBy(smeId, projectId);
        List<Application> received = applications.findByProject(projectId).stream()
                .filter(application -> application.status() != ApplicationStatus.WITHDRAWN)
                .toList();
        List<ApplicantView> ranked = views(project, received).stream()
                .sorted(Comparator.comparingInt((ApplicantView view) -> view.match().percent()).reversed()
                        .thenComparing(view -> view.application().submittedAt()))
                .toList();
        List<SkillSummary> projectSkills = ordered(project.skillCodes());
        return new ProjectApplicantsView(project, projectSkills, ranked);
    }

    @Transactional
    public ApplicantView shortlist(UUID smeId, UUID applicationId) {
        requireSme(smeId);
        Application current = applications.findByIdForUpdate(applicationId).orElseThrow(ContributorApplicationService::notFound);
        StaffingProject project = projects.ownedBy(smeId, current.projectId());
        Application shortlisted = current.shortlist(clock.instant());
        applications.save(shortlisted);
        return views(project, List.of(shortlisted)).getFirst();
    }

    /**
     * Accepts one applicant: the project starts with them assigned and every other open application is rejected,
     * all in one transaction (FR-APP-05, BR-05, BR-13). The project row is locked first, then its applications.
     */
    @Transactional
    public ApplicantView accept(UUID smeId, UUID applicationId) {
        requireSme(smeId);
        Application target = applications.findById(applicationId).orElseThrow(ContributorApplicationService::notFound);
        StaffingProject started = projects.startWork(smeId, target.projectId(), target.contributorId());
        Instant now = clock.instant();
        Application accepted = null;
        for (Application application : applications.findByProjectForUpdate(target.projectId())) {
            if (application.id().equals(applicationId)) {
                accepted = application.accept(smeId, now);
                applications.save(accepted);
            } else if (application.status().isOpen()) {
                applications.save(application.rejectForAcceptedPeer(smeId, now));
            }
        }
        if (accepted == null) throw ContributorApplicationService.notFound();
        return views(started, List.of(accepted)).getFirst();
    }

    /** The applicant's current CV, readable by the SME owning the project the application targets. */
    @Transactional(readOnly = true)
    public CvFile cv(UUID smeId, UUID applicationId) {
        requireSme(smeId);
        Application application = applications.findById(applicationId).orElseThrow(ContributorApplicationService::notFound);
        projects.ownedBy(smeId, application.projectId());
        return contributors.cvOf(application.contributorId()).orElseThrow(() ->
                new ApplicationException(ApplicationException.CV_NOT_AVAILABLE, "The applicant has no READY CV"));
    }

    /** Open and total applications per project; projects the SME does not own are left out. */
    @Transactional(readOnly = true)
    public Map<String, ApplicationRepository.Counts> counts(UUID smeId, List<String> projectIds) {
        requireSme(smeId);
        List<String> owned = projects.find(projectIds).values().stream()
                .filter(project -> smeId.equals(project.ownerId())).map(StaffingProject::id).toList();
        return applications.countByProjects(owned);
    }

    private List<ApplicantView> views(StaffingProject project, List<Application> received) {
        Map<UUID, ApplicantProfile> profiles = contributors.applicants(
                received.stream().map(Application::contributorId).toList()).stream()
                .collect(Collectors.toMap(ApplicantProfile::userId, Function.identity()));
        return received.stream().map(application -> {
            ApplicantProfile profile = profiles.get(application.contributorId());
            SkillMatch match = SkillMatch.of(project.skillCodes(),
                    profile.skills().stream().map(SkillSummary::code).toList());
            return new ApplicantView(application, profile, match);
        }).toList();
    }

    private List<SkillSummary> ordered(List<String> codes) {
        Map<String, SkillSummary> byCode = skills.findByCodes(codes);
        return codes.stream().map(byCode::get).filter(Objects::nonNull).toList();
    }

    private void requireSme(UUID smeId) {
        if (!accounts.isApprovedSme(smeId)) {
            throw new ApplicationException(ApplicationException.SME_NOT_APPROVED, "An approved SME account is required");
        }
    }
}
