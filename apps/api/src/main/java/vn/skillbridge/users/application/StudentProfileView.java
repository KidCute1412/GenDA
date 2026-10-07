package vn.skillbridge.users.application;

import java.util.List;
import java.util.UUID;
import vn.skillbridge.users.domain.StudyYear;

public record StudentProfileView(
        UUID userId,
        String email,
        String displayName,
        String school,
        String major,
        StudyYear studyYear,
        List<SkillSummary> skills,
        boolean complete) {

    public StudentProfileView {
        skills = List.copyOf(skills);
    }
}
