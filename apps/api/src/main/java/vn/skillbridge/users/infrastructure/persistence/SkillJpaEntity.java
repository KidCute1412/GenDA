package vn.skillbridge.users.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "skills")
class SkillJpaEntity {
    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    @Column(nullable = false, unique = true, length = 120)
    private String name;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    protected SkillJpaEntity() {}

    UUID id() { return id; }
    String code() { return code; }
    String name() { return name; }
    int displayOrder() { return displayOrder; }
}
