package vn.skillbridge.users.infrastructure.persistence;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "contributor_profiles")
class ContributorProfileJpaEntity {
    @Id
    @Column(name = "user_id")
    UUID userId;

    @Column(name = "background_type", nullable = false, length = 32)
    String backgroundType;

    @Column(nullable = false, length = 180)
    String specialization;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "contributor_profile_skills", joinColumns = @JoinColumn(name = "user_id"))
    @OrderColumn(name = "position")
    @Column(name = "skill_code", nullable = false, length = 64)
    List<String> skillCodes = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    Instant updatedAt;

    protected ContributorProfileJpaEntity() {}

    ContributorProfileJpaEntity(UUID userId, String backgroundType, String specialization, List<String> skillCodes,
            Instant createdAt, Instant updatedAt) {
        this.userId = userId;
        this.backgroundType = backgroundType;
        this.specialization = specialization;
        this.skillCodes = new ArrayList<>(skillCodes);
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
