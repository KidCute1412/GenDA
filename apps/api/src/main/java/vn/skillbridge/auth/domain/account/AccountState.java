package vn.skillbridge.auth.domain.account;

public enum AccountState {
    PENDING_EMAIL_VERIFICATION,
    EMAIL_VERIFIED,
    ACTIVE,
    DISABLED
}
