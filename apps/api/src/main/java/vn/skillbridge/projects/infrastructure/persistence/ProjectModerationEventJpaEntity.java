package vn.skillbridge.projects.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "project_moderation_events")
class ProjectModerationEventJpaEntity {
    @Id
    private UUID id;

    @Column(name = "project_id", nullable = false, updatable = false)
    private UUID projectId;

    @Column(name = "actor_id", nullable = false, updatable = false)
    private UUID actorId;

    @Column(nullable = false, updatable = false, length = 16)
    private String action;

    @Column(updatable = false, length = 1000)
    private String reason;

    @Column(name = "suggested_complexity", updatable = false, length = 16)
    private String suggestedComplexity;

    @Column(name = "occurred_at", nullable = false, updatable = false)
    private Instant occurredAt;

    protected ProjectModerationEventJpaEntity() {}

    ProjectModerationEventJpaEntity(UUID id, UUID projectId, UUID actorId, String action, String reason,
            String suggestedComplexity, Instant occurredAt) {
        this.id = id;
        this.projectId = projectId;
        this.actorId = actorId;
        this.action = action;
        this.reason = reason;
        this.suggestedComplexity = suggestedComplexity;
        this.occurredAt = occurredAt;
    }

    UUID id() { return id; }
    UUID projectId() { return projectId; }
    UUID actorId() { return actorId; }
    String action() { return action; }
    String reason() { return reason; }
    String suggestedComplexity() { return suggestedComplexity; }
    Instant occurredAt() { return occurredAt; }
}
