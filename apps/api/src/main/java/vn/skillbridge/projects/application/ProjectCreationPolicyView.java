package vn.skillbridge.projects.application;

import java.util.List;
import vn.skillbridge.projects.domain.ProjectComplexity;

public record ProjectCreationPolicyView(long minimumBudget, long maximumBudget, List<LevelView> levels) {
    public ProjectCreationPolicyView {
        levels = List.copyOf(levels);
    }

    public record LevelView(ProjectComplexity complexity, long minimumBudget, long maximumBudget) {}
}
