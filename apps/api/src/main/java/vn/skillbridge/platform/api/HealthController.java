package vn.skillbridge.platform.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class HealthController {
    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping(value = "/api/v1/health", produces = "application/json")
    @Operation(operationId = "health", summary = "Application and database readiness")
    @ApiResponse(responseCode = "200", description = "Ready", content = @Content(mediaType = "application/json", schema = @Schema(implementation = HealthResponse.class)))
    @ApiResponse(responseCode = "503", description = "Database unavailable", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiExceptionHandler.ApiError.class)))
    public HealthResponse health() {
        try (Connection connection = dataSource.getConnection()) {
            if (!connection.isValid(2)) throw new SQLException("Database unavailable");
        } catch (SQLException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Service unavailable");
        }
        return new HealthResponse("ok", "genda-api");
    }

    public record HealthResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, allowableValues = "ok") String status,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, allowableValues = "genda-api") String service) {}
}
