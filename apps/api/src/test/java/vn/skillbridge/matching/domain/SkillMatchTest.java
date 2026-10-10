package vn.skillbridge.matching.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class SkillMatchTest {
    @Test
    void scoresTheShareOfRequiredSkillsTheContributorDeclared() {
        SkillMatch match = SkillMatch.of(List.of("react", "typescript", "figma"), List.of("figma", "react", "seo"));

        assertThat(match.matchedSkills()).containsExactly("react", "figma");
        assertThat(match.totalSkills()).isEqualTo(3);
        assertThat(match.percent()).isEqualTo(67);
    }

    @Test
    void handlesNoOverlapAndProjectsWithoutSkills() {
        assertThat(SkillMatch.of(List.of("seo"), List.of("react")).percent()).isZero();
        assertThat(SkillMatch.of(List.of(), List.of("react")).percent()).isZero();
        assertThat(SkillMatch.of(List.of("react", "react"), List.of("react")).percent()).isEqualTo(100);
    }
}
