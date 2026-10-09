package vn.skillbridge.projects.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.skillbridge.projects.api.dto.ProjectCreationPolicyResponse;
import vn.skillbridge.projects.api.dto.ProjectDetailResponse;
import vn.skillbridge.projects.api.dto.ProjectPageResponse;
import vn.skillbridge.projects.application.ProjectQueryService;
import vn.skillbridge.projects.application.ProjectSearch;
import vn.skillbridge.platform.api.ApiExceptionHandler.ApiError;

@Validated
@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {
    private final ProjectQueryService queries;

    public ProjectController(ProjectQueryService queries) {
        this.queries = queries;
    }

    @GetMapping
    @Operation(summary = "Browse published projects")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Published project page"),
            @ApiResponse(responseCode = "400", description = "Invalid filter", content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "500", description = "Unexpected error", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ProjectPageResponse browse(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<String> skill,
            @RequestParam(required = false) @Min(0) Long minBudget,
            @RequestParam(required = false) @Min(0) Long maxBudget,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "12") @Min(1) @Max(100) int pageSize) {
        return ProjectPageResponse.from(queries.browse(
                new ProjectSearch(q, skill, minBudget, maxBudget, page, pageSize)));
    }

    @GetMapping("/creation-policy")
    @Operation(summary = "Get the server-owned project level budget policy used when creating projects")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Current project creation policy")
    })
    public ProjectCreationPolicyResponse creationPolicy() {
        return ProjectCreationPolicyResponse.from(queries.creationPolicy());
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get one published project")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Published project detail"),
            @ApiResponse(responseCode = "404", description = "Project not found", content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "500", description = "Unexpected error", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ProjectDetailResponse detail(@PathVariable String projectId) {
        return ProjectDetailResponse.from(queries.getPublished(projectId));
    }
}
