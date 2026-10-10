package vn.skillbridge.milestones.infrastructure.persistence;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="milestone_events")
class MilestoneEventJpaEntity {
 @Id UUID id;
 @Column(name="milestone_id",nullable=false) UUID milestoneId;
 @Column(name="actor_id",nullable=false) UUID actorId;
 @Column(nullable=false,length=32) String action;
 @Column(length=2000) String reason;
 @Column(name="occurred_at",nullable=false) Instant occurredAt;
}
