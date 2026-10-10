package vn.skillbridge.applications.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import vn.skillbridge.applications.application.ProjectApplicantsView;

public record ProjectApplicantsResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String projectId,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String projectTitle,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String projectStatus,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, allowableValues = {"BASIC", "MEDIUM", "HIGH"}) String complexity,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<ApplicantProjectSkillResponse> projectSkills,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED,
                description = "Best skill match first; withdrawn applications are omitted") List<ApplicantResponse> applicants) {

    public static ProjectApplicantsResponse from(ProjectApplicantsView view) {
        var project = view.project();
        return new ProjectApplicantsResponse(project.id(), project.title(), project.status(), project.complexity(),
                view.projectSkills().stream().map(skill -> new ApplicantProjectSkillResponse(skill.code(), skill.name())).toList(),
                view.applicants().stream().map(ApplicantResponse::from).toList());
    }

    public record ApplicantProjectSkillResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String code,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String name) {
    }
}
