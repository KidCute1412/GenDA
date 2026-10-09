package vn.skillbridge.users.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.users.api.dto.ContributorProfileResponse;
import vn.skillbridge.users.api.dto.UpdateContributorProfileRequest;
import vn.skillbridge.users.application.ContributorProfileService;
import vn.skillbridge.users.application.UpdateContributorProfileCommand;

@RestController
@RequestMapping("/api/v1/users/me/profile")
@SecurityRequirement(name = "cookieAuth")
public class ContributorProfileController {
    private final ContributorProfileService profiles;

    public ContributorProfileController(ContributorProfileService profiles) {
        this.profiles = profiles;
    }

    @GetMapping
    @Operation(summary = "View the authenticated contributor's profile")
    public ContributorProfileResponse get(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return ContributorProfileResponse.from(profiles.get(principal.id()));
    }

    @PutMapping
    @Operation(summary = "Replace the contributor's self-declared background, specialization and skills")
    public ContributorProfileResponse update(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @Valid @RequestBody UpdateContributorProfileRequest request) {
        var command = new UpdateContributorProfileCommand(request.displayName(), request.backgroundType(),
                request.specialization(), request.skillCodes());
        return ContributorProfileResponse.from(profiles.update(principal.id(), command));
    }
}
