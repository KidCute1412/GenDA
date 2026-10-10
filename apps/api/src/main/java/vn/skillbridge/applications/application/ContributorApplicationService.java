package vn.skillbridge.applications.application;

import java.time.Clock;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.applications.domain.Application;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.projects.application.staffing.ProjectStaffingService;
import vn.skillbridge.projects.application.staffing.StaffingProject;
import vn.skillbridge.users.application.eligibility.ApplicationEligibility;
import vn.skillbridge.users.application.eligibility.ContributorEligibilityService;

/** The contributor's side: apply, list own applications, withdraw (FR-APP-01, 02, 06, 07). */
@Service
public class ContributorApplicationService {
    private final ApplicationRepository applications;
    private final ProjectStaffingService projects;
    private final ContributorEligibilityService eligibility;
    private final AccountProfileService accounts;
    private final Clock clock;

    public ContributorApplicationService(ApplicationRepository applications, ProjectStaffingService projects,
            ContributorEligibilityService eligibility, AccountProfileService accounts, Clock clock) {
        this.applications = applications;
        this.projects = projects;
        this.eligibility = eligibility;
        this.accounts = accounts;
        this.clock = clock;
    }

    /**
     * Server-side gate: the project is open, the contributor meets the general checklist and the tier for the
     * project level, and has no other active application to it. The checklist on the client is only guidance.
     */
    @Transactional
    public ContributorApplicationView apply(UUID contributorId, String projectId, String coverLetter) {
        requireContributor(contributorId);
        StaffingProject project = projects.lockForApplication(projectId);
        if (!project.isPublished()) {
            throw new ApplicationException(ApplicationException.PROJECT_NOT_OPEN,
                    "The project is no longer accepting applications", Map.of("projectStatus", project.status()));
        }
        ApplicationEligibility gate = eligibility.evaluate(contributorId, project.complexity());
        if (!gate.eligible()) {
            Map<String, Object> details = new LinkedHashMap<>();
            details.put("missing", gate.missing());
            details.put("projectLevel", project.complexity());
            details.put("requiredTier", gate.requiredTier());
            details.put("currentTier", gate.tier());
            details.put("totalXp", gate.totalXp());
            details.put("missingXp", gate.missingXp());
            throw new ApplicationException(ApplicationException.NOT_ELIGIBLE,
                    "The contributor does not meet the conditions to apply", details);
        }
        if (applications.hasActive(projectId, contributorId)) throw alreadyApplied();

        Application application = Application.submit(UUID.randomUUID(), projectId, contributorId, coverLetter,
                clock.instant());
        try {
            applications.save(application);
        } catch (ApplicationRepository.DuplicateApplicationException exception) {
            throw alreadyApplied();
        }
        return new ContributorApplicationView(application, project);
    }

    @Transactional(readOnly = true)
    public List<ContributorApplicationView> listMine(UUID contributorId) {
        requireContributor(contributorId);
        List<Application> mine = applications.findByContributor(contributorId);
        Map<String, StaffingProject> byId = projects.find(mine.stream().map(Application::projectId).distinct().toList());
        return mine.stream().filter(application -> byId.containsKey(application.projectId()))
                .map(application -> new ContributorApplicationView(application, byId.get(application.projectId())))
                .toList();
    }

    @Transactional
    public ContributorApplicationView withdraw(UUID contributorId, UUID applicationId) {
        requireContributor(contributorId);
        Application current = applications.findByIdForUpdate(applicationId)
                .filter(application -> application.isOwnedBy(contributorId))
                .orElseThrow(ContributorApplicationService::notFound);
        Application withdrawn = current.withdraw(clock.instant());
        applications.save(withdrawn);
        StaffingProject project = projects.find(List.of(withdrawn.projectId())).get(withdrawn.projectId());
        return new ContributorApplicationView(withdrawn, project);
    }

    private void requireContributor(UUID userId) {
        if (!"CONTRIBUTOR".equals(accounts.get(userId).role())) {
            throw new ApplicationException(ApplicationException.CONTRIBUTOR_ROLE_REQUIRED,
                    "A contributor account is required");
        }
    }

    private static ApplicationException alreadyApplied() {
        return new ApplicationException(ApplicationException.ALREADY_APPLIED,
                "You already have an active application to this project");
    }

    static ApplicationException notFound() {
        return new ApplicationException(ApplicationException.NOT_FOUND, "Application was not found");
    }
}
