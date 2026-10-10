package vn.skillbridge.applications.application;

import java.util.List;
import vn.skillbridge.projects.application.staffing.StaffingProject;
import vn.skillbridge.users.application.SkillSummary;

public record ProjectApplicantsView(StaffingProject project, List<SkillSummary> projectSkills, List<ApplicantView> applicants) {

    public ProjectApplicantsView {
        projectSkills = List.copyOf(projectSkills);
        applicants = List.copyOf(applicants);
    }
}
