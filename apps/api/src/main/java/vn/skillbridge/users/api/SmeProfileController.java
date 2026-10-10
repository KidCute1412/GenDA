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
import vn.skillbridge.users.api.dto.SmeProfileResponse;
import vn.skillbridge.users.api.dto.UpdateSmeProfileRequest;
import vn.skillbridge.users.application.SmeProfileService;

@RestController
@RequestMapping("/api/v1/users/me/sme-profile")
@SecurityRequirement(name = "cookieAuth")
public class SmeProfileController {
    private final SmeProfileService profiles;

    public SmeProfileController(SmeProfileService profiles) {
        this.profiles = profiles;
    }

    @GetMapping
    @Operation(operationId = "getSmeProfile", summary = "View the authenticated SME's self-declared profile")
    public SmeProfileResponse get(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return SmeProfileResponse.from(profiles.get(principal.id()));
    }

    @PutMapping
    @Operation(operationId = "updateSmeProfile", summary = "Update the SME's business name, description and industry")
    public SmeProfileResponse update(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @Valid @RequestBody UpdateSmeProfileRequest request) {
        return SmeProfileResponse.from(profiles.update(principal.id(), request.displayName(), request.description(), request.industry()));
    }
}
