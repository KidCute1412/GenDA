package vn.skillbridge.admin.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.skillbridge.admin.api.dto.ReturnProjectRequest;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.platform.api.ApiExceptionHandler.ApiError;
import vn.skillbridge.projects.api.dto.ManagedProjectResponse;
import vn.skillbridge.projects.application.moderation.ProjectModerationService;

/** Admin entrypoint for the project review queue; the transitions themselves belong to the projects module. */
@RestController
@RequestMapping("/api/v1/admin/projects")
@SecurityRequirement(name = "cookieAuth")
public class AdminProjectController {
    private final ProjectModerationService moderation;

    public AdminProjectController(ProjectModerationService moderation) {
        this.moderation = moderation;
    }

    @GetMapping("/pending")
    @Operation(summary = "List projects waiting for review, oldest submission first")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Review queue"),
            @ApiResponse(responseCode = "403", description = "Not an admin", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public List<ManagedProjectResponse> pending(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return moderation.pendingQueue(principal.id()).stream().map(ManagedProjectResponse::from).toList();
    }

    @PostMapping("/{projectId}/publish")
    @Operation(summary = "Publish a project pending review (PENDING_REVIEW -> PUBLISHED)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Project published"),
            @ApiResponse(responseCode = "404", description = "Project not found", content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "409", description = "Project is not pending review", content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "422", description = "Project no longer satisfies the publication rules", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ManagedProjectResponse publish(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable String projectId) {
        return ManagedProjectResponse.from(moderation.publish(principal.id(), projectId));
    }

    @PostMapping("/{projectId}/return")
    @Operation(summary = "Return a project to its SME as a draft with a mandatory reason (PENDING_REVIEW -> DRAFT)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Project returned to draft"),
            @ApiResponse(responseCode = "400", description = "Missing or invalid reason", content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Project not found", content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "409", description = "Project is not pending review", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ManagedProjectResponse returnToDraft(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable String projectId, @Valid @RequestBody ReturnProjectRequest request) {
        return ManagedProjectResponse.from(moderation.returnToDraft(principal.id(), projectId, request.reason(),
                request.suggestedComplexity()));
    }
}
