package vn.skillbridge.projects.application;

public class ProjectNotFoundException extends RuntimeException {
    public ProjectNotFoundException(String projectId) {
        super("Published project not found: " + projectId);
    }
}
