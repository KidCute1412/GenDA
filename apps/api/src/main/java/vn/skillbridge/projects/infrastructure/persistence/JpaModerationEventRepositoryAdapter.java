package vn.skillbridge.projects.infrastructure.persistence;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Repository;
import vn.skillbridge.projects.application.ModerationEventRepository;
import vn.skillbridge.projects.application.ProjectException;
import vn.skillbridge.projects.domain.ModerationAction;
import vn.skillbridge.projects.domain.ModerationEvent;
import vn.skillbridge.projects.domain.ProjectComplexity;
import vn.skillbridge.projects.infrastructure.persistence.SpringDataProjectRepository.ProjectIdentity;

@Repository
class JpaModerationEventRepositoryAdapter implements ModerationEventRepository {
    private final SpringDataProjectModerationEventRepository events;
    private final SpringDataProjectRepository projects;

    JpaModerationEventRepositoryAdapter(SpringDataProjectModerationEventRepository events,
            SpringDataProjectRepository projects) {
        this.events = events;
        this.projects = projects;
    }

    @Override
    public void append(ModerationEvent event) {
        UUID projectId = projects.findByPublicIdIn(List.of(event.projectId())).stream()
                .findFirst()
                .map(ProjectIdentity::getId)
                .orElseThrow(() -> new ProjectException(ProjectException.NOT_FOUND,
                        "Project not found: " + event.projectId()));
        events.save(new ProjectModerationEventJpaEntity(event.id(), projectId, event.actorId(),
                event.action().name(), event.reason(),
                event.suggestedComplexity() == null ? null : event.suggestedComplexity().name(),
                event.occurredAt()));
    }

    @Override
    public Map<String, ModerationEvent> findLatestByProjectIds(Collection<String> projectIds) {
        if (projectIds.isEmpty()) return Map.of();
        Map<UUID, String> publicIds = projects.findByPublicIdIn(projectIds).stream()
                .collect(Collectors.toMap(ProjectIdentity::getId, ProjectIdentity::getPublicId));
        if (publicIds.isEmpty()) return Map.of();
        Map<String, ModerationEvent> latest = new HashMap<>();
        // Newest first, so the first event seen for each project is its latest.
        for (var entity : events.findByProjectIdInOrderByOccurredAtDesc(publicIds.keySet())) {
            String publicId = publicIds.get(entity.projectId());
            latest.putIfAbsent(publicId, new ModerationEvent(entity.id(), publicId, entity.actorId(),
                    ModerationAction.valueOf(entity.action()), entity.reason(),
                    entity.suggestedComplexity() == null ? null : ProjectComplexity.valueOf(entity.suggestedComplexity()),
                    entity.occurredAt()));
        }
        return latest;
    }
}
