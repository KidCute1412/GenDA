package vn.skillbridge.users.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.skillbridge.users.application.SkillQueryService;
import vn.skillbridge.platform.api.ApiExceptionHandler.ApiError;

@RestController
@RequestMapping("/api/v1/skills")
public class SkillController {
    private final SkillQueryService queries;

    public SkillController(SkillQueryService queries) {
        this.queries = queries;
    }

    @GetMapping
    @Operation(summary = "List the canonical skill catalog")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Canonical skill catalog"),
            @ApiResponse(responseCode = "500", description = "Unexpected error", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public List<SkillCatalogItemResponse> list() {
        return queries.listSkills().stream()
                .map(skill -> new SkillCatalogItemResponse(skill.code(), skill.name()))
                .toList();
    }

    public record SkillCatalogItemResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String code,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String name) {}
}
