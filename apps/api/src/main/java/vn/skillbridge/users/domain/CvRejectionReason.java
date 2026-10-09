package vn.skillbridge.users.domain;

/** Why a CV upload failed technical validation. Each reason maps to an action the contributor can take. */
public enum CvRejectionReason {
    EMPTY,
    TOO_LARGE,
    NOT_PDF,
    CORRUPTED,
    PASSWORD_PROTECTED
}
