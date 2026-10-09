package vn.skillbridge.projects.application.staffing;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** What the applications module needs to know about a project; plain values, no projects domain types. */
public record StaffingProject(
        String id,
        UUID ownerId,
        String title,
        String smeName,
        String smeContact,
        String status,
        String complexity,
        Long budget,
        LocalDate deadline,
        List<String> skillCodes,
        UUID assignedContributorId) {

    public StaffingProject {
        skillCodes = List.copyOf(skillCodes);
    }

    public boolean isPublished() {
        return "PUBLISHED".equals(status);
    }
}
