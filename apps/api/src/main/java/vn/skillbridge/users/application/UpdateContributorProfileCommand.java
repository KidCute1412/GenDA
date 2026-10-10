package vn.skillbridge.users.application;

import java.util.List;
import vn.skillbridge.users.domain.BackgroundType;

public record UpdateContributorProfileCommand(
        String displayName,
        BackgroundType backgroundType,
        String specialization,
        List<String> skillCodes) {
}
