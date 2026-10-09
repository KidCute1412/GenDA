package vn.skillbridge.users.application.eligibility;

import java.util.ArrayList;
import java.util.List;
import vn.skillbridge.users.application.ApplicationReadiness;

/**
 * Whether a contributor may self-apply to a project of a given level right now: the general checklist plus the
 * tier gate (FR-APP-01, FR-APP-09). Tier and level are plain names so other modules need no users domain types.
 */
public record ApplicationEligibility(
        ApplicationReadiness readiness,
        String tier,
        int totalXp,
        String requiredTier,
        int requiredXp,
        boolean levelUnlocked) {

    public static final String ACCOUNT_INACTIVE = "ACCOUNT_INACTIVE";
    public static final String EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED";
    public static final String PROFILE_INCOMPLETE = "PROFILE_INCOMPLETE";
    public static final String CV_NOT_READY = "CV_NOT_READY";
    public static final String TIER_REQUIRED = "TIER_REQUIRED";

    /** Stable codes of every unmet condition, in checklist order. */
    public List<String> missing() {
        List<String> missing = new ArrayList<>();
        if (!readiness.accountActive()) missing.add(ACCOUNT_INACTIVE);
        if (!readiness.emailVerified()) missing.add(EMAIL_NOT_VERIFIED);
        if (!readiness.profileComplete()) missing.add(PROFILE_INCOMPLETE);
        if (!readiness.cvReady()) missing.add(CV_NOT_READY);
        if (!levelUnlocked) missing.add(TIER_REQUIRED);
        return List.copyOf(missing);
    }

    public boolean eligible() {
        return missing().isEmpty();
    }

    public int missingXp() {
        return levelUnlocked ? 0 : Math.max(0, requiredXp - totalXp);
    }
}
