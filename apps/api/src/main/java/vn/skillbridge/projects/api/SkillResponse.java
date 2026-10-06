package vn.skillbridge.projects.api;

import io.swagger.v3.oas.annotations.media.Schema;
import vn.skillbridge.users.application.SkillSummary;

public record SkillResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String code,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String name) {
    static SkillResponse from(SkillSummary skill) {
        return new SkillResponse(skill.code(), skill.name());
    }
}
