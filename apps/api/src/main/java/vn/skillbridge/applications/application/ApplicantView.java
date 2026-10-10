package vn.skillbridge.applications.application;

import vn.skillbridge.applications.domain.Application;
import vn.skillbridge.applications.domain.ApplicationStatus;
import vn.skillbridge.matching.domain.SkillMatch;
import vn.skillbridge.users.application.eligibility.ApplicantProfile;

/** One applicant as the owning SME reviews them. The contact email is revealed only once they are accepted. */
public record ApplicantView(Application application, ApplicantProfile profile, SkillMatch match) {

    public String contactEmail() {
        return application.status() == ApplicationStatus.ACCEPTED
                ? profile.email() : null;
    }
}
