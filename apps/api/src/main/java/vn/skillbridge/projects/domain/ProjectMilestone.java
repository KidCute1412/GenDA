package vn.skillbridge.projects.domain;

import java.time.LocalDate;
import java.util.List;

public record ProjectMilestone(
        String id,
        int order,
        String title,
        long budget,
        LocalDate deadline,
        List<String> criteria) {

    public ProjectMilestone {
        criteria = List.copyOf(criteria);
    }
}
