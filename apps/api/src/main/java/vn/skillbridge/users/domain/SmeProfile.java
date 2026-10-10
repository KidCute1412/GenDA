package vn.skillbridge.users.domain;

import java.util.UUID;

public record SmeProfile(UUID userId, String description, String industry) {
    public SmeProfile {
        description = optionalText(description, 2000);
        industry = optionalText(industry, 120);
    }

    private static String optionalText(String value, int maxLength) {
        if (value == null || value.isBlank()) return null;
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new ContributorRuleViolation("SME_PROFILE_INVALID", "SME profile text is too long");
        }
        return normalized;
    }
}
