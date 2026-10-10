package vn.skillbridge.users.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

/** The PDF bytes, mapped apart from the metadata so readiness checks never load them. */
@Entity
@Table(name = "contributor_cv_files")
class CvFileJpaEntity {
    @Id
    @Column(name = "user_id")
    UUID userId;

    @Column(nullable = false, columnDefinition = "bytea")
    byte[] content;

    protected CvFileJpaEntity() {}

    CvFileJpaEntity(UUID userId, byte[] content) {
        this.userId = userId;
        this.content = content;
    }
}
