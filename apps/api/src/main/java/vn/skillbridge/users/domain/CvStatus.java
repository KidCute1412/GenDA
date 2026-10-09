package vn.skillbridge.users.domain;

/**
 * CV lifecycle. MVP validates synchronously, so stored CVs are always {@code READY}; the transient states
 * exist for a later asynchronous scanning pipeline. A rejected upload is reported, not stored.
 */
public enum CvStatus {
    UPLOADING,
    PROCESSING,
    READY
}
