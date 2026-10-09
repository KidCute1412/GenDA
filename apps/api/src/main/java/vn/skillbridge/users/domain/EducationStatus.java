package vn.skillbridge.users.domain;

/**
 * {@code GRADUATED} asserts the stated degree was awarded; {@code COMPLETED} records completion without
 * asserting a degree; {@code NOT_COMPLETED} records attendance without completion.
 */
public enum EducationStatus {
    CURRENTLY_STUDYING,
    GRADUATED,
    COMPLETED,
    NOT_COMPLETED;

    public boolean isFinished() {
        return this != CURRENTLY_STUDYING;
    }
}
