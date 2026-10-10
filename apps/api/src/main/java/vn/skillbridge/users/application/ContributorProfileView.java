package vn.skillbridge.users.application;

import java.util.List;
import java.util.UUID;
import vn.skillbridge.users.domain.BackgroundType;

public record ContributorProfileView(
        UUID userId,
        String email,
        String displayName,
        BackgroundType backgroundType,
        String specialization,
        List<SkillSummary> skills,
        boolean complete) {

    public ContributorProfileView {
        skills = List.copyOf(skills);
    }
}
