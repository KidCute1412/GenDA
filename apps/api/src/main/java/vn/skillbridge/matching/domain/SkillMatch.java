package vn.skillbridge.matching.domain;

import java.util.Collection;
import java.util.List;
import java.util.Set;

/**
 * Explicit rule-based match (FR-MAT-01): the share of the project's required skills the contributor declared.
 * It ranks applicants for the SME and never accepts or rejects anyone (FR-MAT-04).
 */
public record SkillMatch(List<String> matchedSkills, int totalSkills, int percent) {

    public SkillMatch {
        matchedSkills = List.copyOf(matchedSkills);
    }

    public static SkillMatch of(List<String> projectSkills, Collection<String> contributorSkills) {
        Set<String> declared = Set.copyOf(contributorSkills);
        List<String> required = projectSkills.stream().distinct().toList();
        List<String> matched = required.stream().filter(declared::contains).toList();
        int percent = required.isEmpty() ? 0 : Math.round(matched.size() * 100f / required.size());
        return new SkillMatch(matched, required.size(), percent);
    }
}
