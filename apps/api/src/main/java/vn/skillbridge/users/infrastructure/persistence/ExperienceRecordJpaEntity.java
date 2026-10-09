package vn.skillbridge.users.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.Immutable;

/** Read-only view of the completed-project ledger; the completion use case owns writes. */
@Entity
@Immutable
@Table(name = "contributor_experience_records")
@IdClass(ExperienceRecordJpaEntity.Key.class)
class ExperienceRecordJpaEntity {
    @Id
    @Column(name = "contributor_id")
    UUID contributorId;

    @Id
    @Column(name = "project_id")
    UUID projectId;

    @Column(name = "project_title", nullable = false, length = 180)
    String projectTitle;

    @Column(name = "sme_name", nullable = false, length = 180)
    String smeName;

    @Column(nullable = false, length = 16)
    String complexity;

    @Column(name = "completed_at", nullable = false)
    Instant completedAt;

    protected ExperienceRecordJpaEntity() {}

    record Key(UUID contributorId, UUID projectId) implements Serializable {
        Key() {
            this(null, null);
        }
    }
}
