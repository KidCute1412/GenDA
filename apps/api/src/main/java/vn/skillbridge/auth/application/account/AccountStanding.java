package vn.skillbridge.auth.application.account;

/** Account facts other modules may need for derived eligibility, without exposing the auth record. */
public record AccountStanding(boolean active, boolean emailVerified) {
}
