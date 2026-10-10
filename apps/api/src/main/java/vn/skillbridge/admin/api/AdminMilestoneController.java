package vn.skillbridge.admin.api;

import java.util.UUID;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.milestones.application.MilestoneService;
import vn.skillbridge.milestones.api.dto.MilestoneRequests.MilestoneFundingRequest;

@RestController @RequestMapping("/api/v1/admin/milestones")
@SecurityRequirement(name="cookieAuth")
public class AdminMilestoneController {
    private final MilestoneService milestones;
    public AdminMilestoneController(MilestoneService milestones) { this.milestones=milestones; }
    @PostMapping("/{milestoneId}/funding") @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary="Record a simulated funding transition with a required admin support reason")
    public void funding(@AuthenticationPrincipal AuthenticatedPrincipal actor,@PathVariable UUID milestoneId,
            @Valid @RequestBody MilestoneFundingRequest request) {
        milestones.funding(actor.id(),milestoneId,request.target(),request.reason(),true);
    }
}
