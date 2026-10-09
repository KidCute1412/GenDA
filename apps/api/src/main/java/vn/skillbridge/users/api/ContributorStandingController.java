package vn.skillbridge.users.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.users.api.dto.ApplicationReadinessResponse;
import vn.skillbridge.users.api.dto.ExperienceResponse;
import vn.skillbridge.users.application.ApplicationReadinessService;
import vn.skillbridge.users.application.ExperienceService;

@RestController
@RequestMapping("/api/v1/users/me")
@SecurityRequirement(name = "cookieAuth")
public class ContributorStandingController {
    private final ApplicationReadinessService readiness;
    private final ExperienceService experience;

    public ContributorStandingController(ApplicationReadinessService readiness, ExperienceService experience) {
        this.readiness = readiness;
        this.experience = experience;
    }

    @GetMapping("/readiness")
    @Operation(summary = "Application readiness checklist: account, email, profile and CV")
    public ApplicationReadinessResponse readiness(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return ApplicationReadinessResponse.from(readiness.readiness(principal.id()));
    }

    @GetMapping("/experience")
    @Operation(summary = "XP, tier, unlocked project levels and completed-project history")
    public ExperienceResponse experience(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return ExperienceResponse.from(experience.standing(principal.id()));
    }
}
