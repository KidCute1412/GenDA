package vn.skillbridge.users.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import vn.skillbridge.users.application.SkillSummary;

public record SkillCatalogItemResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String code,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String name) {

    public static SkillCatalogItemResponse from(SkillSummary skill) {
        return new SkillCatalogItemResponse(skill.code(), skill.name());
    }
}
