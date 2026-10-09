package vn.skillbridge.projects.application.authoring;

import java.time.LocalDate;
import java.util.List;
import vn.skillbridge.projects.domain.ProjectComplexity;

/** The full editable draft content; every save replaces the previous draft content. */
public record ProjectDraftCommand(
        String title,
        String summary,
        String problem,
        String industry,
        String smeSize,
        ProjectComplexity complexity,
        Long budget,
        LocalDate deadline,
        List<String> skillCodes,
        List<String> acceptanceCriteria,
        List<MilestonePlanCommand> milestones) {

    public ProjectDraftCommand {
        skillCodes = skillCodes == null ? List.of() : List.copyOf(skillCodes);
        acceptanceCriteria = acceptanceCriteria == null ? List.of() : List.copyOf(acceptanceCriteria);
        milestones = milestones == null ? List.of() : List.copyOf(milestones);
    }

    public record MilestonePlanCommand(String title, long budget, LocalDate deadline, List<String> criteria) {
        public MilestonePlanCommand {
            criteria = criteria == null ? List.of() : List.copyOf(criteria);
        }
    }
}
