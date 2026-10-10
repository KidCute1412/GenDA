package vn.skillbridge.milestones.infrastructure.persistence;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="handoffs")
class HandoffJpaEntity {
 @Id UUID id;
 @Column(name="milestone_id",nullable=false) UUID milestoneId;
 @Column(nullable=false) int revision;
 @Column(name="actor_id",nullable=false) UUID actorId;
 @Column(nullable=false,columnDefinition="text") String note;
 @Column(nullable=false,columnDefinition="text") String links;
 @Column(name="submitted_at",nullable=false) Instant submittedAt;
 @Column(length=32) String decision;
 @Column(length=2000) String reason;
 @Column(name="decided_by") UUID decidedBy;
 @Column(name="decided_at") Instant decidedAt;
}
