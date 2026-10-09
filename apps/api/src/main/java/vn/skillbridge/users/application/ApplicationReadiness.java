package vn.skillbridge.users.application;

/** The general application checklist (canApplyGeneral). Tier gates per project level are separate. */
public record ApplicationReadiness(
        boolean accountActive,
        boolean emailVerified,
        boolean profileComplete,
        boolean cvReady) {

    public boolean ready() {
        return accountActive && emailVerified && profileComplete && cvReady;
    }
}
