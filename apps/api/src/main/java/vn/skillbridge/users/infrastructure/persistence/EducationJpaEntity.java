package vn.skillbridge.users.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "contributor_education")
class EducationJpaEntity {
    @Id
    UUID id;

    @Column(name = "user_id", nullable = false)
    UUID userId;

    @Column(nullable = false, length = 180)
    String institution;

    @Column(name = "field_of_study", nullable = false, length = 180)
    String fieldOfStudy;

    @Column(name = "education_level", nullable = false, length = 32)
    String educationLevel;

    @Column(name = "degree_name", length = 180)
    String degreeName;

    @Column(name = "start_month")
    LocalDate startMonth;

    @Column(name = "end_month")
    LocalDate endMonth;

    @Column(nullable = false, length = 32)
    String status;

    @Column(length = 1000)
    String description;

    @Column(name = "created_at", nullable = false)
    Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    Instant updatedAt;

    protected EducationJpaEntity() {}

    EducationJpaEntity(UUID id, UUID userId) {
        this.id = id;
        this.userId = userId;
    }
}
