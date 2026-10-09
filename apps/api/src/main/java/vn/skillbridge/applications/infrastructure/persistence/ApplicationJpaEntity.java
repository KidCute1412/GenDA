package vn.skillbridge.applications.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "applications")
class ApplicationJpaEntity {
    @Id
    UUID id;

    @Column(name = "project_id", nullable = false, updatable = false, length = 100)
    String projectId;

    @Column(name = "contributor_id", nullable = false, updatable = false)
    UUID contributorId;

    @Column(name = "cover_letter", nullable = false, length = 3000)
    String coverLetter;

    @Column(nullable = false, length = 16)
    String status;

    @Column(name = "eligibility_source", nullable = false, length = 16)
    String eligibilitySource;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    Instant submittedAt;

    @Column(name = "updated_at", nullable = false)
    Instant updatedAt;

    @Column(name = "decided_at")
    Instant decidedAt;

    @Column(name = "decided_by")
    UUID decidedBy;

    protected ApplicationJpaEntity() {}

    ApplicationJpaEntity(UUID id, String projectId, UUID contributorId, Instant submittedAt) {
        this.id = id;
        this.projectId = projectId;
        this.contributorId = contributorId;
        this.submittedAt = submittedAt;
    }
}
