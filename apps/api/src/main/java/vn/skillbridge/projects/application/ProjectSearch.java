package vn.skillbridge.projects.application;

import java.util.List;

public record ProjectSearch(
        String query,
        List<String> skillCodes,
        Long minBudget,
        Long maxBudget,
        int page,
        int pageSize) {

    public ProjectSearch {
        query = query == null || query.isBlank() ? null : query.trim();
        skillCodes = skillCodes == null
                ? List.of()
                : skillCodes.stream().filter(value -> value != null && !value.isBlank()).map(String::trim).distinct().toList();
        if (minBudget != null && maxBudget != null && minBudget > maxBudget) {
            throw new InvalidProjectFilterException("minBudget must be less than or equal to maxBudget");
        }
    }
}
