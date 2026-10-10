package vn.skillbridge.users.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "contributor_cvs")
class CvJpaEntity {
    @Id
    @Column(name = "user_id")
    UUID userId;

    @Column(name = "file_name", nullable = false, length = 255)
    String fileName;

    @Column(name = "size_bytes", nullable = false)
    int sizeBytes;

    @Column(name = "page_count", nullable = false)
    int pageCount;

    @Column(nullable = false, length = 64)
    String sha256;

    @Column(nullable = false, length = 24)
    String status;

    @Column(name = "uploaded_at", nullable = false)
    Instant uploadedAt;

    protected CvJpaEntity() {}

    CvJpaEntity(UUID userId) {
        this.userId = userId;
    }
}
