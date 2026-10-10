package vn.skillbridge.projects.infrastructure.persistence;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataProjectModerationEventRepository extends JpaRepository<ProjectModerationEventJpaEntity, UUID> {
    List<ProjectModerationEventJpaEntity> findByProjectIdInOrderByOccurredAtDesc(Collection<UUID> projectIds);
}
