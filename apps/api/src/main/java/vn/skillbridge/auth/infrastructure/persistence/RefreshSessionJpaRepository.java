package vn.skillbridge.auth.infrastructure.persistence;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface RefreshSessionJpaRepository extends JpaRepository<RefreshSessionJpaEntity, UUID> {
}
