package vn.skillbridge.users.application;

import java.util.List;
import vn.skillbridge.users.domain.StudyYear;

public record UpdateStudentProfileCommand(
        String displayName,
        String school,
        String major,
        StudyYear studyYear,
        List<String> skillCodes) {
}
