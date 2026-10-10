package vn.skillbridge.applications.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.skillbridge.applications.api.dto.ContributorApplicationResponse;
import vn.skillbridge.applications.api.dto.CreateApplicationRequest;
import vn.skillbridge.applications.application.ContributorApplicationService;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;

@RestController
@RequestMapping("/api/v1/applications")
@SecurityRequirement(name = "cookieAuth")
public class ApplicationController {
    private final ContributorApplicationService applications;

    public ApplicationController(ContributorApplicationService applications) {
        this.applications = applications;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Apply to a published project",
            description = "422 APPLICATION_NOT_ELIGIBLE lists details.missing (ACCOUNT_INACTIVE, PROFILE_INCOMPLETE, "
                    + "PROFILE_INCOMPLETE, CV_NOT_READY, TIER_REQUIRED) with requiredTier, currentTier and missingXp.")
    public ContributorApplicationResponse apply(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @Valid @RequestBody CreateApplicationRequest request) {
        return ContributorApplicationResponse.from(
                applications.apply(principal.id(), request.projectId(), request.coverLetter()));
    }

    @GetMapping("/me")
    @Operation(summary = "The contributor's applications, newest first")
    public List<ContributorApplicationResponse> mine(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return applications.listMine(principal.id()).stream().map(ContributorApplicationResponse::from).toList();
    }

    @PostMapping("/{applicationId}/withdraw")
    @Operation(summary = "Withdraw an application that is still under review")
    public ContributorApplicationResponse withdraw(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable UUID applicationId) {
        return ContributorApplicationResponse.from(applications.withdraw(principal.id(), applicationId));
    }
}
