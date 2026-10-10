package vn.skillbridge.applications.application;

import vn.skillbridge.applications.domain.Application;
import vn.skillbridge.projects.application.staffing.StaffingProject;

public record ContributorApplicationView(Application application, StaffingProject project) {
}
