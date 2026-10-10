package vn.skillbridge.milestones.infrastructure.persistence;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="milestone_ai_reviews")
class AiReviewJpaEntity {
 @Id UUID id;
 @Column(name="handoff_id",nullable=false) UUID handoffId;
 @Column(name="requested_by",nullable=false) UUID requestedBy;
 @Column(nullable=false,length=16) String state;
 @Column(nullable=false,length=32) String provider;
 @Column(nullable=false,length=100) String model;
 @Column(name="prompt_version",nullable=false,length=32) String promptVersion;
 @Column(name="started_at",nullable=false) Instant startedAt;
 @Column(name="finished_at") Instant finishedAt;
 @Column(columnDefinition="text") String report;
 @Column(nullable=false,columnDefinition="text") String sources;
 @Column(nullable=false,columnDefinition="text") String warnings;
 @Column(name="error_code",length=64) String errorCode;
 @Column(name="input_tokens") Long inputTokens;
 @Column(name="output_tokens") Long outputTokens;
}
