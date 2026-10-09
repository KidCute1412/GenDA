package vn.skillbridge.applications.domain;

public enum ApplicationStatus {
    SUBMITTED,
    SHORTLISTED,
    ACCEPTED,
    REJECTED,
    WITHDRAWN;

    /** Counts towards the one-active-application rule (FR-APP-02). */
    public boolean isActive() {
        return this == SUBMITTED || this == SHORTLISTED || this == ACCEPTED;
    }

    /** Still waiting for the SME's decision. */
    public boolean isOpen() {
        return this == SUBMITTED || this == SHORTLISTED;
    }
}
