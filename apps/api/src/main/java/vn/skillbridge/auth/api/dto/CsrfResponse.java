package vn.skillbridge.auth.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record CsrfResponse(@Schema(requiredMode = Schema.RequiredMode.REQUIRED) String token) {
}
