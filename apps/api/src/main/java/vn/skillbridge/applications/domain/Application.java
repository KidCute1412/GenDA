package vn.skillbridge.applications.domain;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * One contributor's application to one project (FR-APP-01..07).
 *
 * <pre>SUBMITTED → SHORTLISTED → ACCEPTED / REJECTED, and SUBMITTED or SHORTLISTED → WITHDRAWN</pre>
 *
 * Acceptance and rejection record the deciding SME and time (BR-09). The SME never writes a rejection by hand:
 * accepting one applicant rejects every other open application of the project.
 */
public record Application(
        UUID id,
        String projectId,
        UUID contributorId,
        String coverLetter,
        ApplicationStatus status,
        EligibilitySource eligibilitySource,
        Instant submittedAt,
        Instant updatedAt,
        Instant decidedAt,
        UUID decidedBy) {

    public static final int MIN_COVER_LETTER = 80;
    public static final int MAX_COVER_LETTER = 3000;

    public static Application submit(UUID id, String projectId, UUID contributorId, String coverLetter, Instant now) {
        String letter = coverLetter == null ? "" : coverLetter.strip();
        if (letter.length() < MIN_COVER_LETTER || letter.length() > MAX_COVER_LETTER) {
            throw new ApplicationRuleViolation(ApplicationRuleViolation.COVER_LETTER_LENGTH,
                    "The cover letter must be between " + MIN_COVER_LETTER + " and " + MAX_COVER_LETTER + " characters",
                    Map.of("minimum", MIN_COVER_LETTER, "maximum", MAX_COVER_LETTER, "length", letter.length()));
        }
        return new Application(id, projectId, contributorId, letter, ApplicationStatus.SUBMITTED,
                EligibilitySource.SELF, now, now, null, null);
    }

    public boolean isOwnedBy(UUID userId) {
        return contributorId.equals(userId);
    }

    public Application withdraw(Instant now) {
        requireOpen("Only an application still under review can be withdrawn");
        return with(ApplicationStatus.WITHDRAWN, now, null, null);
    }

    public Application shortlist(Instant now) {
        if (status != ApplicationStatus.SUBMITTED) {
            throw invalid("Only a newly submitted application can be shortlisted");
        }
        return with(ApplicationStatus.SHORTLISTED, now, null, null);
    }

    public Application accept(UUID smeId, Instant now) {
        requireOpen("Only an application still under review can be accepted");
        return with(ApplicationStatus.ACCEPTED, now, now, smeId);
    }

    /** Another applicant of the same project was accepted (FR-APP-05). */
    public Application rejectForAcceptedPeer(UUID smeId, Instant now) {
        requireOpen("Only an application still under review can be rejected");
        return with(ApplicationStatus.REJECTED, now, now, smeId);
    }

    private void requireOpen(String message) {
        if (!status.isOpen()) throw invalid(message);
    }

    private ApplicationRuleViolation invalid(String message) {
        return new ApplicationRuleViolation(ApplicationRuleViolation.INVALID_TRANSITION, message,
                Map.of("status", status.name()));
    }

    private Application with(ApplicationStatus next, Instant now, Instant decidedAt, UUID decidedBy) {
        return new Application(id, projectId, contributorId, coverLetter, next, eligibilitySource, submittedAt, now,
                decidedAt, decidedBy);
    }
}
