package vn.skillbridge.milestones.infrastructure.persistence;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="handoff_attachments")
class AttachmentJpaEntity {
 @Id UUID id;
 @Column(name="milestone_id",nullable=false) UUID milestoneId;
 @Column(name="handoff_id") UUID handoffId;
 @Column(name="owner_id",nullable=false) UUID ownerId;
 @Column(nullable=false,length=180) String name;
 @Column(name="media_type",nullable=false,length=64) String mediaType;
 @Column(nullable=false) long size;
 @Column(name="object_key",nullable=false,length=500) String objectKey;
 @Column(name="uploaded_at",nullable=false) Instant uploadedAt;
}
