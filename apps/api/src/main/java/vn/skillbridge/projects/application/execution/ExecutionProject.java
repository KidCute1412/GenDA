package vn.skillbridge.projects.application.execution;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ExecutionProject(String id, UUID ownerId, UUID contributorId, String title, String smeName,
        String status, List<Plan> plans) {
    public record Plan(String id, int order, String title, long budget, LocalDate deadline, List<String> criteria) {}
}
