package vn.skillbridge.projects.application;

import java.util.Optional;
import vn.skillbridge.projects.domain.PublishedProject;

public interface PublishedProjectRepository {
    ProjectPage<PublishedProject> findPublished(ProjectSearch search);
    Optional<PublishedProject> findPublishedById(String projectId);
}
