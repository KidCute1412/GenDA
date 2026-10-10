package vn.skillbridge.platform.api;

import io.swagger.v3.core.converter.ModelConverters;
import io.swagger.v3.core.util.Json;
import org.junit.jupiter.api.Test;
import vn.skillbridge.platform.api.dto.ApiError;
import static org.assertj.core.api.Assertions.assertThat;

class ApiErrorContractTest {
    @Test
    void preservesTheErrorJsonAndOpenApiSchema() throws Exception {
        var json = Json.mapper().valueToTree(new ApiError("VALIDATION_FAILED", "Invalid request", "request-1"));
        assertThat(json)
                .isEqualTo(Json.mapper().readTree("""
                        {"code":"VALIDATION_FAILED","message":"Invalid request","requestId":"request-1"}
                        """));
        var schemas = ModelConverters.getInstance().read(ApiError.class);
        assertThat(schemas).containsOnlyKeys("ApiError");
        var schemaJson = Json.mapper().valueToTree(schemas.get("ApiError"));
        assertThat(schemaJson).isEqualTo(Json.mapper().readTree("""
                {
                  "type": "object",
                  "properties": {
                    "code": {"type": "string"},
                    "message": {"type": "string"},
                    "requestId": {"type": "string"},
                    "details": {"type": "object", "additionalProperties": {"type": "object"}}
                  },
                  "required": ["code", "message", "requestId"]
                }
                """));
    }
}
