package vn.skillbridge.projects.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.platform.api.dto.ApiError;
import vn.skillbridge.projects.api.dto.ManagedProjectResponse;
import vn.skillbridge.projects.api.dto.ProjectDraftRequest;
import vn.skillbridge.projects.application.authoring.ProjectAuthoringService;

@RestController
@RequestMapping("/api/v1/sme/projects")
@SecurityRequirement(name = "cookieAuth")
public class SmeProjectController {
    private final ProjectAuthoringService projects;

    public SmeProjectController(ProjectAuthoringService projects) {
        this.projects = projects;
    }

    @GetMapping
    @Operation(summary = "List the authenticated SME's projects in every state, most recently updated first")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Owned projects"),
            @ApiResponse(responseCode = "403", description = "Not an approved SME", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public List<ManagedProjectResponse> list(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return projects.listOwn(principal.id()).stream().map(ManagedProjectResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a draft project")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Draft created"),
            @ApiResponse(responseCode = "400", description = "Invalid draft content", content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Not an approved SME", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ManagedProjectResponse create(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @Valid @RequestBody ProjectDraftRequest request) {
        return ManagedProjectResponse.from(projects.create(principal.id(), request.toCommand()));
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get one of the authenticated SME's projects")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Owned project"),
            @ApiResponse(responseCode = "404", description = "Project not found or not owned", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ManagedProjectResponse get(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable String projectId) {
        return ManagedProjectResponse.from(projects.getOwn(principal.id(), projectId));
    }

    @PutMapping("/{projectId}")
    @Operation(summary = "Replace the content of an owned draft project")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Draft saved"),
            @ApiResponse(responseCode = "400", description = "Invalid draft content", content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Project not found or not owned", content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "409", description = "Project is no longer a draft", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ManagedProjectResponse update(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable String projectId, @Valid @RequestBody ProjectDraftRequest request) {
        return ManagedProjectResponse.from(projects.update(principal.id(), projectId, request.toCommand()));
    }

    @PostMapping("/{projectId}/submit")
    @Operation(summary = "Submit an owned draft for admin review (DRAFT -> PENDING_REVIEW)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Project is pending review"),
            @ApiResponse(responseCode = "404", description = "Project not found or not owned", content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "409", description = "Project is not a draft", content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "422", description = "Draft incomplete or budget outside the level range", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ManagedProjectResponse submit(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable String projectId) {
        return ManagedProjectResponse.from(projects.submit(principal.id(), projectId));
    }
}
