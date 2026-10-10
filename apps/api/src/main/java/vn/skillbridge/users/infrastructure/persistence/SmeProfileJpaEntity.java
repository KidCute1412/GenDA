package vn.skillbridge.users.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "sme_profiles")
class SmeProfileJpaEntity {
    @Id
    @Column(name = "user_id")
    UUID userId;
    @Column(length = 2000)
    String description;
    @Column(length = 120)
    String industry;

    protected SmeProfileJpaEntity() {}

    SmeProfileJpaEntity(UUID userId, String description, String industry) {
        this.userId = userId;
        this.description = description;
        this.industry = industry;
    }
}
