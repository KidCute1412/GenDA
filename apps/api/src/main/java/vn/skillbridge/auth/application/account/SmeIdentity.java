package vn.skillbridge.auth.application.account;

/** Self-declared registration details, not evidence of business verification. */
public record SmeIdentity(String taxCode, String companyWebsite) {}
